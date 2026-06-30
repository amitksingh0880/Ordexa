import { prisma } from "../lib/prisma";
import { scopeTemplateToTenant, tenantSuperArn } from "../constants/arn";

export interface ResolvedAccess {
  tenantId: string;
  role: string;
  permissions: string[]; // tenant-scoped ARNs ready for the JWT
}

export const resolveUserAccess = async (userId: string): Promise<ResolvedAccess | null> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const mappings = await prisma.accessUserRoleMapping.findMany({
    where: { userId, isDeleted: false },
  });
  const roleIds = mappings.map((m) => m.roleId);

  const roles = await prisma.accessRole.findMany({
    where: { id: { in: roleIds }, isActive: true, isDeleted: false },
  });

  const arns = new Set<string>();
  if (roles.some((r) => r.isSuperAdmin)) {
    arns.add(tenantSuperArn(user.tenantId));
  }

  const activeRoleIds = roles.map((r) => r.id);
  if (activeRoleIds.length > 0) {
    const permMappings = await prisma.accessRolePermissionMapping.findMany({
      where: { roleId: { in: activeRoleIds }, isDeleted: false },
    });
    const permissionIds = [...new Set(permMappings.map((m) => m.permissionId))];
    const permissions = await prisma.accessPermission.findMany({
      where: { id: { in: permissionIds }, isActive: true },
    });
    for (const p of permissions) {
      arns.add(scopeTemplateToTenant(p.resourceArn, user.tenantId));
    }
  }

  return { tenantId: user.tenantId, role: user.role, permissions: [...arns] };
};

export const listPermissions = () =>
  prisma.accessPermission.findMany({ orderBy: { permissionName: "asc" } });

export const listRoles = async (tenantId: string) => {
  const roles = await prisma.accessRole.findMany({
    where: { tenantId, isDeleted: false },
    orderBy: { roleName: "asc" },
  });
  return Promise.all(
    roles.map(async (role) => {
      const mappings = await prisma.accessRolePermissionMapping.findMany({
        where: { roleId: role.id, isDeleted: false },
      });
      const permissionIds = mappings.map((m) => m.permissionId);
      const permissions = await prisma.accessPermission.findMany({
        where: { id: { in: permissionIds } },
        select: { resourceArn: true },
      });
      return { ...role, assignedArns: permissions.map((p) => p.resourceArn) };
    }),
  );
};

export const assignRolePermissions = async (
  roleId: string,
  permissionIds: string[],
): Promise<void> => {
  await prisma.accessRolePermissionMapping.deleteMany({ where: { roleId } });
  if (permissionIds.length > 0) {
    await prisma.accessRolePermissionMapping.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
    });
  }
};

export const assignUserRoles = async (
  userId: string,
  roleIds: string[],
): Promise<void> => {
  await prisma.accessUserRoleMapping.deleteMany({ where: { userId } });
  if (roleIds.length > 0) {
    await prisma.accessUserRoleMapping.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
    });
  }
};

export const listTenantUsers = async (tenantId: string) => {
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(
    users.map(async (user) => {
      const mappings = await prisma.accessUserRoleMapping.findMany({
        where: { userId: user.id, isDeleted: false },
      });
      return { ...user, roleIds: mappings.map((m) => m.roleId) };
    }),
  );
};
