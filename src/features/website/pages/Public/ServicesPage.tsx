import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';
import { useWebsiteContent } from '../../website.hooks';

export default function ServicesPagePublic() {
  const { data = [] } = useWebsiteContent();
  const services = data.find((section: any) => section.section_key === 'services');

  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="Explore the services offered by our clinic." />
      <div className="grid gap-6 lg:grid-cols-2">
        {services?.content?.items?.length ? (
          services.content.items.map((item: any) => (
            <Card key={item.title} className="p-6">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-slate-600">{item.description}</p>
              <div className="mt-4 text-sm text-slate-500">Duration: {item.duration}</div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-slate-600">Service listings are not configured yet.</Card>
        )}
      </div>
    </div>
  );
}
