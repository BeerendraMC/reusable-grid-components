export interface IEmployee {
  id: number;
  name: string | {};
  description?: string;
  gender: string;
  phone: number;
  dob: Date | string;
  email: string;
  homeTown?: {};
}
