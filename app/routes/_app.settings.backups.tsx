import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import type { Route } from './+types/_app.settings.config';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { PageContent, PageHeader, Pagination, ProtectedRoute } from '~/components/common';
import { Button } from '~/components/ui/button';
import {
  ConfigTable,
  ConfigFormDialog,
  ConfigFilters,
  useConfigs,
  useCreateConfig,
  useUpdateConfig,
  useDeleteConfig,
} from '~/features/config';
import type { Configuration, CreateConfigDto, UpdateConfigDto } from '~/types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Configurações | VMS' },
    { name: 'description', content: 'Gerenciar configurações - Video Management System' },
  ];
}

const DEFAULT_ITEMS_PER_PAGE = 50;

export default function SettingsBackupPage() {
  return (
    <ProtectedRoute permission="configuration:read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Backups e Restauração"
            description="Gerencie os backups e restaurações do sistema"
          ></PageHeader>
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
