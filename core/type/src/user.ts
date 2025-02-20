import type {AlwatrDocumentObject} from './storage.js';

export const genderCS = ['male', 'female'] as const;
export type Gender = typeof genderCS[number];

export interface User extends AlwatrDocumentObject {
  /**
   * User global unique id (verifiable)
   */
  id: string;

  fullName: string;

  phoneNumber: string;

  gender: Gender;

  email?: string;

  landlinePhone?: string;

  /**
   * Country Code.
   */
  country: string;

  /**
   * Province Code.
   */
  province?: string;

  /**
   * City Code.
   */
  city?: string;

  /**
   * User full address.
   */
  address?: string;

  postalCode?: string;
}
