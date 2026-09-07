/**
 * GovFormsPH — Types for CS Form No. 212 (Personal Data Sheet, Revised 2026)
 * Strict compliance with Civil Service Commission (CSC) Form 212 (Revised 2026) specifications.
 */

export interface PdsMeta {
  createdAt: string;
  updatedAt: string;
  formVersion: 'CS-Form-212-2026';
  title?: string;
}

export type CivilStatus = 'Single' | 'Married' | 'Widow/er' | 'Separated' | 'Solo Parent' | 'Others';

export type SexAtBirth = 'Male' | 'Female' | '';

export type CitizenshipType = 'Filipino' | 'Dual Citizenship' | '';

export type DualCitizenshipMode = 'by birth' | 'by naturalization' | '';

export interface Address {
  houseBlockLot: string;
  street: string;
  subdivisionVillage: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipCode: string;
}

export interface PersonalInfo {
  surname: string;
  firstName: string;
  middleName: string;
  nameExtension: string; // e.g. Jr., Sr., III
  dateOfBirth: string; // dd/mm/yyyy
  placeOfBirth: string;
  sexAtBirth: SexAtBirth;
  civilStatus: CivilStatus | '';
  civilStatusOthersSpecify: string;
  height: string; // in meters (m)
  weight: string; // in kilograms (kg)
  bloodType: string;
  umidIdNo: string;
  pagIbigIdNo: string;
  philhealthNo: string;
  philSysCardNumber: string; // PCN (Item 13)
  tinNo: string;
  agencyEmployeeNo: string;
  citizenship: CitizenshipType;
  dualCitizenshipMode: DualCitizenshipMode;
  dualCitizenshipCountry: string;
  residentialAddress: Address;
  permanentAddress: Address;
  sameAsResidentialAddress?: boolean;
  telephoneNo: string;
  mobileNo: string;
  emailAddress: string;
}

export interface SpouseInfo {
  surname: string;
  firstName: string;
  middleName: string;
  nameExtension: string;
  occupation: string;
  employerBusinessName: string;
  businessAddress: string;
  telephoneNo: string;
}

export interface ChildItem {
  id: string;
  fullName: string;
  dateOfBirth: string; // dd/mm/yyyy
}

export interface ParentInfo {
  surname: string;
  firstName: string;
  middleName: string;
  nameExtension?: string;
  maidenSurname?: string;
}

export interface FamilyBackground {
  spouse: SpouseInfo;
  children: ChildItem[];
  father: ParentInfo;
  mother: ParentInfo;
}

export interface EducationEntry {
  id?: string;
  nameOfSchool: string;
  degreeCourse: string;
  periodFromYear: string; // yyyy only
  periodToYear: string;   // yyyy only
  highestLevelUnitsEarned: string;
  yearGraduated: string;  // yyyy only
  scholarshipAcademicHonors: string;
}

export interface EducationalBackground {
  elementary: EducationEntry;
  secondary: EducationEntry;
  vocationalTrade: EducationEntry[];
  college: EducationEntry[];
  graduateStudies: EducationEntry[];
}

export interface EligibilityItem {
  id: string;
  careerServiceRA1080OrSpecialLaw: string;
  rating: string;
  dateOfExamConferment: string; // dd/mm/yyyy
  placeOfExamConferment: string;
  licenseNumber: string;
  licenseValidityDate: string; // dd/mm/yyyy
}

export interface WorkExperienceItem {
  id: string;
  inclusiveDatesFrom: string; // dd/mm/yyyy
  inclusiveDatesTo: string;   // dd/mm/yyyy or 'Present'
  isPresent: boolean; // true if currently holding this position
  positionTitle: string;
  departmentAgencyOfficeCompany: string;
  monthlySalary: string;
  salaryJobPayGradeStepIncrement: string; // e.g. "SG 15-1"
  statusOfAppointment: string; // Permanent / Temporary / Contractual / Casual / Job Order / Co-terminus
  isGovernmentService: boolean | null;
  dutiesDescription?: string; // Work Experience Sheet attachment description
}

export interface TrainingItem {
  id: string;
  title: string;
  inclusiveDatesFrom: string; // dd/mm/yyyy
  inclusiveDatesTo: string;   // dd/mm/yyyy
  numberOfHours: string;
  typeOfLD: string; // Managerial / Supervisory / Technical / etc.
  conductedSponsoredBy: string;
}

export interface VoluntaryWorkItem {
  id: string;
  organizationNameAddress: string;
  inclusiveDatesFrom: string; // dd/mm/yyyy
  inclusiveDatesTo: string;   // dd/mm/yyyy
  numberOfHours: string;
  positionNatureOfWork: string;
}

export interface OtherInfo {
  specialSkillsHobbies: string[];
  nonAcademicDistinctions: string[];
  membershipInAssociations: string[];
}

export interface TriStateQuestion {
  answer: boolean | null; // true | false | null (unanswered)
  details?: string;
}

export interface CriminallyChargedQuestion extends TriStateQuestion {
  dateFiled?: string;
  statusOfCase?: string;
}

export interface ImmigrantQuestion extends TriStateQuestion {
  country?: string;
}

export interface IndigenousQuestion extends TriStateQuestion {
  specify?: string;
}

export interface PwdQuestion extends TriStateQuestion {
  pwdIdNo?: string;
}

export interface SoloParentQuestion extends TriStateQuestion {
  soloParentIdNo?: string;
}

export interface BackgroundQuestions {
  relatedWithinThirdDegree: TriStateQuestion;             // 34a
  relatedWithinFourthDegreeLGU: TriStateQuestion;         // 34b
  foundGuiltyOfAdminOffense: TriStateQuestion;            // 35a
  criminallyChargedInCourt: CriminallyChargedQuestion;    // 35b
  convictedOfCrimeOrViolation: TriStateQuestion;          // 36
  separatedFromService: TriStateQuestion;                 // 37
  candidateInNationalLocalElection: TriStateQuestion;     // 38a
  resignedToCampaignForCandidate: TriStateQuestion;       // 38b
  immigrantOrPermanentResidentAbroad: ImmigrantQuestion;  // 39
  indigenousGroupMember: IndigenousQuestion;              // 40a
  personWithDisability: PwdQuestion;                      // 40b
  soloParent: SoloParentQuestion;                         // 40c
}

export interface ReferenceItem {
  id: string;
  name: string;
  officeResidentialAddress: string;
  contactNoOrEmail: string;
}

export interface DeclarationSignatories {
  governmentIssuedId: string;
  idLicensePassportNo: string;
  dateOfIssuance: string;
  placeOfIssuance: string;
  idPhoto: string | null;       // Base64 Data URL or Object URL for passport photo
  signature: string | null;     // Base64 signature image
  rightThumbmark: string | null; // Base64 thumbmark image
  dateAccomplished: string;     // dd/mm/yyyy
  acknowledgedTerms: boolean;
}

export interface PdsRecord {
  id?: number;
  meta: PdsMeta;
  personalInfo: PersonalInfo;
  familyBackground: FamilyBackground;
  education: EducationalBackground;
  eligibility: EligibilityItem[];
  workExperience: WorkExperienceItem[];
  trainings: TrainingItem[];
  voluntaryWork: VoluntaryWorkItem[];
  otherInfo: OtherInfo;
  backgroundQuestions: BackgroundQuestions;
  references: ReferenceItem[];
  declaration: DeclarationSignatories;
}

export interface AppSettings {
  id?: number;
  theme: 'light' | 'dark' | 'system';
  hasSeenTour: boolean;
  autoSaveInterval: number; // in milliseconds, default 800
  lastExportDate?: string;
  hideExportReminder?: boolean;
}
