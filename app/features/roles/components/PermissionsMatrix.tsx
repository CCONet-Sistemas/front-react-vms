import { useMemo } from 'react';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import type { Permission } from '~/types/permissions';

interface PermissionsMatrixProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

const RESOURCE_LABELS: Record<string, string> = {
  user: 'Usuários',
  camera: 'Câmeras',
  stream: 'Streams',
  video: 'Vídeos',
  recording: 'Gravações',
  event: 'Eventos',
  notification: 'Notificações',
  configuration: 'Configurações',
  backup: 'Backup',
  media_core: 'Media Core',
  role: 'Perfis',
  group: 'Grupos',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Criar',
  read: 'Visualizar',
  update: 'Editar',
  delete: 'Excluir',
  execute: 'Executar',
};

const ACTION_ORDER = ['create', 'read', 'update', 'delete', 'execute'];

function getPermissionKey(permission: Permission): string {
  return `${permission.resource}:${permission.action}`;
}

export function PermissionsMatrix({
  permissions,
  selectedPermissions,
  onChange,
  disabled = false,
}: PermissionsMatrixProps) {
  const { groupedPermissions, resources, actions } = useMemo(() => {
    const grouped: Record<string, Record<string, Permission>> = {};
    const resourceSet = new Set<string>();
    const actionSet = new Set<string>();

    permissions.forEach((perm) => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = {};
      }
      grouped[perm.resource][perm.action] = perm;
      resourceSet.add(perm.resource);
      actionSet.add(perm.action);
    });

    const sortedActions = Array.from(actionSet).sort(
      (a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b)
    );

    const sortedResources = Array.from(resourceSet).sort((a, b) =>
      (RESOURCE_LABELS[a] || a).localeCompare(RESOURCE_LABELS[b] || b)
    );

    return {
      groupedPermissions: grouped,
      resources: sortedResources,
      actions: sortedActions,
    };
  }, [permissions]);

  const handleToggle = (permissionKey: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedPermissions, permissionKey]);
    } else {
      onChange(selectedPermissions.filter((key) => key !== permissionKey));
    }
  };

  const handleToggleRow = (resource: string) => {
    const resourcePermissions = Object.values(groupedPermissions[resource] || {});
    const resourceKeys = resourcePermissions.map(getPermissionKey);
    const allSelected = resourceKeys.every((key) => selectedPermissions.includes(key));

    if (allSelected) {
      onChange(selectedPermissions.filter((key) => !resourceKeys.includes(key)));
    } else {
      const newKeys = new Set([...selectedPermissions, ...resourceKeys]);
      onChange(Array.from(newKeys));
    }
  };

  const handleToggleColumn = (action: string) => {
    const actionPermissions = resources
      .map((resource) => groupedPermissions[resource]?.[action])
      .filter(Boolean) as Permission[];
    const actionKeys = actionPermissions.map(getPermissionKey);
    const allSelected = actionKeys.every((key) => selectedPermissions.includes(key));

    if (allSelected) {
      onChange(selectedPermissions.filter((key) => !actionKeys.includes(key)));
    } else {
      const newKeys = new Set([...selectedPermissions, ...actionKeys]);
      onChange(Array.from(newKeys));
    }
  };

  const handleToggleAll = () => {
    const allKeys = permissions.map(getPermissionKey);
    const allSelected = allKeys.every((key) => selectedPermissions.includes(key));

    if (allSelected) {
      onChange([]);
    } else {
      onChange(allKeys);
    }
  };

  const isRowFullySelected = (resource: string) => {
    const resourcePermissions = Object.values(groupedPermissions[resource] || {});
    return resourcePermissions.every((p) => selectedPermissions.includes(getPermissionKey(p)));
  };

  const isRowPartiallySelected = (resource: string) => {
    const resourcePermissions = Object.values(groupedPermissions[resource] || {});
    const selected = resourcePermissions.filter((p) =>
      selectedPermissions.includes(getPermissionKey(p))
    );
    return selected.length > 0 && selected.length < resourcePermissions.length;
  };

  const isColumnFullySelected = (action: string) => {
    const actionPermissions = resources
      .map((resource) => groupedPermissions[resource]?.[action])
      .filter(Boolean) as Permission[];
    return actionPermissions.every((p) => selectedPermissions.includes(getPermissionKey(p)));
  };

  const isColumnPartiallySelected = (action: string) => {
    const actionPermissions = resources
      .map((resource) => groupedPermissions[resource]?.[action])
      .filter(Boolean) as Permission[];
    const selected = actionPermissions.filter((p) =>
      selectedPermissions.includes(getPermissionKey(p))
    );
    return selected.length > 0 && selected.length < actionPermissions.length;
  };

  const allKeys = permissions.map(getPermissionKey);
  const allSelected = allKeys.every((key) => selectedPermissions.includes(key));
  const someSelected = selectedPermissions.length > 0 && !allSelected;

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-medium">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={handleToggleAll}
                  disabled={disabled}
                  aria-label="Selecionar todas as permissões"
                />
                <span className="text-sm">Recurso</span>
              </div>
            </th>
            {actions.map((action) => (
              <th key={action} className="p-3 text-center font-medium">
                <div className="flex flex-col items-center gap-1">
                  <Checkbox
                    checked={isColumnFullySelected(action)}
                    indeterminate={isColumnPartiallySelected(action)}
                    onCheckedChange={() => handleToggleColumn(action)}
                    disabled={disabled}
                    aria-label={`Selecionar todas permissões de ${ACTION_LABELS[action] || action}`}
                  />
                  <span className="text-xs">{ACTION_LABELS[action] || action}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => (
            <tr key={resource} className="border-b last:border-b-0 hover:bg-muted/30">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isRowFullySelected(resource)}
                    indeterminate={isRowPartiallySelected(resource)}
                    onCheckedChange={() => handleToggleRow(resource)}
                    disabled={disabled}
                    aria-label={`Selecionar todas permissões de ${RESOURCE_LABELS[resource] || resource}`}
                  />
                  <Label className="text-sm font-medium cursor-pointer">
                    {RESOURCE_LABELS[resource] || resource}
                  </Label>
                </div>
              </td>
              {actions.map((action) => {
                const permission = groupedPermissions[resource]?.[action];
                const permissionKey = permission ? getPermissionKey(permission) : null;
                return (
                  <td key={action} className="p-3 text-center">
                    {permission && permissionKey ? (
                      <Checkbox
                        checked={selectedPermissions.includes(permissionKey)}
                        onCheckedChange={(checked) => handleToggle(permissionKey, checked)}
                        disabled={disabled}
                        aria-label={`${RESOURCE_LABELS[resource] || resource}: ${ACTION_LABELS[action] || action}`}
                      />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
