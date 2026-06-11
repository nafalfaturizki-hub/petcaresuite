export type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked_in' | 'in_consultation' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  queueNumber?: string | null;
  customerId: string;
  customerName?: string | null;
  petId: string;
  petName?: string | null;
  doctorId?: string | null;
  doctorName?: string | null;
  serviceId: string;
  service: string;
  notes?: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  scheduledAt: string;
  status: AppointmentStatus;
  createdAt?: string;
}

export interface AppointmentFormData {
  customerId: string;
  petId: string;
  serviceId: string;
  doctorId?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface AppointmentServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DoctorAvailability {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
}
