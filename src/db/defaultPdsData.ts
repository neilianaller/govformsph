import { PdsRecord } from '../types/pds';

export const createEmptyChild = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
  fullName: '',
  dateOfBirth: '',
});

export const createEmptyEducationEntry = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
  nameOfSchool: '',
  degreeCourse: '',
  periodFromYear: '',
  periodToYear: '',
  highestLevelUnitsEarned: '',
  yearGraduated: '',
  scholarshipAcademicHonors: '',
});

export const createEmptyEligibility = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
  careerServiceRA1080OrSpecialLaw: '',
  rating: '',
  dateOfExamConferment: '',
  placeOfExamConferment: '',
  licenseNumber: '',
  licenseValidityDate: '',
});

export const createEmptyWorkExperience = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
  inclusiveDatesFrom: '',
  inclusiveDatesTo: '',
  isPresent: false,
  positionTitle: '',
  departmentAgencyOfficeCompany: '',
  monthlySalary: '',
  salaryJobPayGradeStepIncrement: '',
  statusOfAppointment: '',
  isGovernmentService: null,
  dutiesDescription: '',
});

export const createEmptyTraining = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
  title: '',
  inclusiveDatesFrom: '',
  inclusiveDatesTo: '',
  numberOfHours: '',
  typeOfLD: '',
  conductedSponsoredBy: '',
});

export const createEmptyVoluntaryWork = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
  organizationNameAddress: '',
  inclusiveDatesFrom: '',
  inclusiveDatesTo: '',
  numberOfHours: '',
  positionNatureOfWork: '',
});

export const createEmptyReference = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
  name: '',
  officeResidentialAddress: '',
  contactNoOrEmail: '',
});

export const createNewPdsRecord = (title: string = 'Personal Data Sheet (CS Form 212)'): PdsRecord => {
  const now = new Date().toISOString();
  return {
    meta: {
      createdAt: now,
      updatedAt: now,
      formVersion: 'CS-Form-212-2026',
      title,
    },
    personalInfo: {
      surname: '',
      firstName: '',
      middleName: '',
      nameExtension: '',
      dateOfBirth: '',
      placeOfBirth: '',
      sexAtBirth: '',
      civilStatus: '',
      civilStatusOthersSpecify: '',
      height: '',
      weight: '',
      bloodType: '',
      umidIdNo: '',
      pagIbigIdNo: '',
      philhealthNo: '',
      philSysCardNumber: '',
      tinNo: '',
      agencyEmployeeNo: '',
      citizenship: 'Filipino',
      dualCitizenshipMode: '',
      dualCitizenshipCountry: '',
      residentialAddress: {
        houseBlockLot: '',
        street: '',
        subdivisionVillage: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        zipCode: '',
      },
      permanentAddress: {
        houseBlockLot: '',
        street: '',
        subdivisionVillage: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        zipCode: '',
      },
      sameAsResidentialAddress: false,
      telephoneNo: '',
      mobileNo: '',
      emailAddress: '',
    },
    familyBackground: {
      spouse: {
        surname: '',
        firstName: '',
        middleName: '',
        nameExtension: '',
        occupation: '',
        employerBusinessName: '',
        businessAddress: '',
        telephoneNo: '',
      },
      children: [createEmptyChild()],
      father: {
        surname: '',
        firstName: '',
        middleName: '',
        nameExtension: '',
      },
      mother: {
        maidenSurname: '',
        surname: '',
        firstName: '',
        middleName: '',
      },
    },
    education: {
      elementary: createEmptyEducationEntry(),
      secondary: createEmptyEducationEntry(),
      vocationalTrade: [createEmptyEducationEntry()],
      college: [createEmptyEducationEntry()],
      graduateStudies: [createEmptyEducationEntry()],
    },
    eligibility: [createEmptyEligibility()],
    workExperience: [createEmptyWorkExperience()],
    trainings: [createEmptyTraining()],
    voluntaryWork: [createEmptyVoluntaryWork()],
    otherInfo: {
      specialSkillsHobbies: [''],
      nonAcademicDistinctions: [''],
      membershipInAssociations: [''],
    },
    backgroundQuestions: {
      relatedWithinThirdDegree: { answer: null, details: '' },
      relatedWithinFourthDegreeLGU: { answer: null, details: '' },
      foundGuiltyOfAdminOffense: { answer: null, details: '' },
      criminallyChargedInCourt: { answer: null, details: '', dateFiled: '', statusOfCase: '' },
      convictedOfCrimeOrViolation: { answer: null, details: '' },
      separatedFromService: { answer: null, details: '' },
      candidateInNationalLocalElection: { answer: null, details: '' },
      resignedToCampaignForCandidate: { answer: null, details: '' },
      immigrantOrPermanentResidentAbroad: { answer: null, country: '' },
      indigenousGroupMember: { answer: null, specify: '' },
      personWithDisability: { answer: null, pwdIdNo: '' },
      soloParent: { answer: null, soloParentIdNo: '' },
    },
    references: [
      createEmptyReference(),
      createEmptyReference(),
      createEmptyReference(),
    ],
    declaration: {
      governmentIssuedId: '',
      idLicensePassportNo: '',
      dateOfIssuance: '',
      placeOfIssuance: '',
      idPhoto: null,
      signature: null,
      rightThumbmark: null,
      dateAccomplished: '',
      acknowledgedTerms: false,
    },
  };
};
