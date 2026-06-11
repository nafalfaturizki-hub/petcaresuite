export interface PortalCustomer {
  id: string;
  fullName: string;
  email: string | null;
  whatsapp: string | null;
  status: string;
  loyaltyPoints: number;
  registeredAt: string;
}

export interface PortalPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  photoUrl?: string | null;
}

export interface PortalAppointment {
  id: string;
  service: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  doctorName?: string | null;
}

export interface PortalInvoice {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface PortalSummary {
  petCount: number;
  appointmentCount: number;
  invoiceCount: number;
}
