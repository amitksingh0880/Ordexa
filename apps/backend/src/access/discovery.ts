import { prisma } from "../lib/prisma";
import { RESOURCES } from "../crud/registry";
import {
  ARN,
  ARN_ACTIONS,
  READONLY_TEMPLATE,
  moduleTemplate,
  humanizeArnSegment,
} from "../constants/arn";

export interface DiscoveredArn {
  template: string;
  name: string;
  description: string;
}

// Guards register the ARN they enforce here (the analogue of reflecting over
// AuthorizeARN attributes), so the catalogue is never hand-maintained.
const guardRegistry = new Set<string>();

export const registerGuardArn = (module: string, action?: string): void => {
  guardRegistry.add(moduleTemplate(module, action));
};

// CRUD ARNs are derived from the policies that actually enforce them.
const collectCrudArns = (): Set<string> => {
  const arns = new Set<string>();
  for (const resource of Object.values(RESOURCES)) {
    const actions = [
      resource.policy.list,
      resource.policy.read,
      resource.policy.create,
      resource.policy.modify,
    ];
    for (const access of actions) {
      if (access.kind === "arn") {
        arns.add(moduleTemplate(access.module, access.action));
      } else if (access.kind === "owner") {
        arns.add(moduleTemplate(access.module));
        arns.add(moduleTemplate(access.module, ARN_ACTIONS.own));
      }
    }
  }
  return arns;
};

const describe = (template: string): DiscoveredArn => {
  if (template === READONLY_TEMPLATE) {
    return { template, name: "Read Only", description: "Read access to guarded modules (GET only)" };
  }
  const [, , , module, action] = template.split(":");
  const name = action
    ? `${humanizeArnSegment(module!)} – ${humanizeArnSegment(action)}`
    : `${humanizeArnSegment(module!)} – Access`;
  return { template, name, description: name };
};

export const discoverArns = (): DiscoveredArn[] => {
  const templates = new Set<string>([
    ...collectCrudArns(),
    ...guardRegistry,
    READONLY_TEMPLATE,
  ]);
  return [...templates].map(describe);
};

export const syncPermissionCatalog = async (): Promise<number> => {
  const discovered = discoverArns();
  for (const entry of discovered) {
    await prisma.accessPermission.upsert({
      where: { resourceArn: entry.template },
      update: { permissionName: entry.name, description: entry.description, isActive: true },
      create: {
        permissionName: entry.name,
        resourceArn: entry.template,
        description: entry.description,
      },
    });
  }
  return discovered.length;
};
