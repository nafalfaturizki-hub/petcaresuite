import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';

export default function ContactPagePublic() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contact" description="Get in touch with the clinic for appointments and support." />
      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold">Visit Us</h2>
          <p className="mt-2 text-slate-600">123 PetCare Lane<br />Animal City, PA 12345</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2 text-slate-600">Email: support@petcare-suite.com<br />Phone: +1 (555) 123-4567</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Hours</h2>
          <p className="mt-2 text-slate-600">Mon - Fri: 8:00 AM - 6:00 PM<br />Sat: 9:00 AM - 2:00 PM</p>
        </div>
      </Card>
    </div>
  );
}
