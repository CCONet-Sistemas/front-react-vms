import { Bell } from 'lucide-react';
import { FlexList, FlexListEmpty } from '~/components/ui/flex-list';
import { EventCard } from './EventCard';
import type { Event } from '~/types';

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  variant?: 'grid' | 'list';
  onViewEvent?: (event: Event) => void;
  onAcknowledgeEvent?: (event: Event) => void;
}

export function EventList({
  events,
  isLoading = false,
  variant = 'grid',
  onViewEvent,
  onAcknowledgeEvent,
}: EventListProps) {
  return (
    <FlexList
      data={events}
      isLoading={isLoading}
      keyExtractor={(event) => event.uuid}
      variant={variant}
      columns={variant === 'grid' ? 'auto' : 1}
      gap="md"
      emptyState={
        <FlexListEmpty
          icon={<Bell className="h-6 w-6 text-muted-foreground" />}
          title="Nenhum evento encontrado"
          description="Não há eventos para exibir com os filtros selecionados."
        />
      }
      renderItem={(event) => (
        <EventCard
          event={event}
          variant={variant}
          onView={onViewEvent}
          onAcknowledge={onAcknowledgeEvent}
        />
      )}
    />
  );
}
