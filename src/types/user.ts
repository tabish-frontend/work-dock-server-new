import { Types } from "mongoose";

export interface BankDetails {
  bank_name: string;
  account_holder_name: string;
  account_number: number;
  iban_number: number;
  city: string;
  branch: string;
}

export interface User {
  full_name: string;
  username: string;
  role: string;
  email: string;
  mobile: string;
  company: string;
  avatar: string;
  department: string;
  designation: string;
  bio: string;
  dob: Date | string;
  country: string;
  languages: string[];
  gender: string;
  identity_number: number;
  identity_type: string;
  bank_details: BankDetails;
  account_status: string;
  time_zone: {
    name: string;
    value: string;
  };
  join_date: Date;
  leave_date: Date | string;
  qualification_certificates: string[];
  qualification: string;
  password: string;
  shift: Types.ObjectId;
}
