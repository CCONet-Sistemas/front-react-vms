import { useParams, Link } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { Button } from '~/components/ui/button';
import { useEvent } from '~/features/events/hooks';
import { EventDetail } from '~/features/events/components/EventDetail';

export default function EventDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: event, isLoading, error } = useEvent(uuid ?? '');

  return (
    <ProtectedRoute resource="event" action="read">
      <PageContent>
        <PageHeader title="Detalhes do Evento" description="Visualização e informações do evento">
          <Link to="/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </PageHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-destructive">
            <p>Erro ao carregar o evento</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </div>
        )}

        {event && <EventDetail event={event} />}
      </PageContent>
    </ProtectedRoute>
  );
}
