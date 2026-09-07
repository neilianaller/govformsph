import { PDFDocument, PDFFont, PDFForm, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFButton, PDFName, PDFDict, StandardFonts } from 'pdf-lib';
import { PdsRecord } from '../types/pds';
import { fieldMap } from './fieldMap-csc2122016-c1.js';

/** Horizontal padding (both sides combined) reserved inside a text field box, in PDF points. */
const AUTO_SIZE_HORIZONTAL_PADDING = 4;
/** Step size used when shrinking font size to fit, in points. */
const AUTO_SIZE_STEP = 0.5;

/**
 * Fills a PDF text field, simulating "auto font size" by shrinking the font until the
 * text fits the field's widget width (pdf-lib does not honor the native PDF auto-size flag).
 * Multiline fields are left to wrap instead of being shrunk. If a single-line field still
 * doesn't fit at the minimum font size, it is switched to multiline so the text wraps
 * instead of clipping.
 */
export function fillAutoSizedTextField(
  form: PDFForm,
  fieldName: string,
  value: unknown,
  options: { maxSize?: number; minSize?: number; font: PDFFont }
): void {
  const { maxSize = 10, minSize = 6, font } = options;
  let text = value != null ? String(value) : '';

  const textField = form.getTextField(fieldName);

  // Respect the field's /MaxLen so setText() doesn't throw and silently skip the whole field.
  const maxLength = textField.getMaxLength();
  if (maxLength !== undefined && text.length > maxLength) {
    console.warn(
      `[GovFormsPH PDF Export] Field "${fieldName}" value (length ${text.length}) exceeds its MaxLen of ${maxLength} and was truncated. Raise the field's MaxLen in the PDF template to show the full value.`
    );
    text = text.slice(0, maxLength);
  }

  if (textField.isMultiline()) {
    textField.setFontSize(maxSize);
    textField.setText(text);
    return;
  }

  if (!text) {
    textField.setFontSize(maxSize);
    textField.setText(text);
    return;
  }

  const widgets = textField.acroField.getWidgets();
  const rect = widgets[0]?.getRectangle();
  const availableWidth = rect ? Math.max(rect.width - AUTO_SIZE_HORIZONTAL_PADDING, 0) : Infinity;

  let fontSize = maxSize;
  while (fontSize > minSize && font.widthOfTextAtSize(text, fontSize) > availableWidth) {
    fontSize = Math.round((fontSize - AUTO_SIZE_STEP) * 100) / 100;
  }

  if (font.widthOfTextAtSize(text, fontSize) > availableWidth) {
    console.warn(
      `[GovFormsPH PDF Export] Field "${fieldName}" text (length ${text.length}) doesn't fit at minimum font size ${minSize}pt. Wrapping onto multiple lines instead.`
    );
    textField.enableMultiline();
  }

  textField.setFontSize(fontSize);
  textField.setText(text);
}

/**
 * Extract value from PdsRecord by appDataKey.
 * Supports:
 * - Direct personalInfo fields (e.g. 'surname', 'firstName', 'dateOfBirth')
 * - Address sub-fields with underscore or dot (e.g. 'residentialAddress_houseBlockLot')
 * - Family background / Education / Top-level properties
 */
/** Parses a strict dd/mm/yyyy string to epoch ms; returns 0 for blank/invalid/out-of-range dates. */
export function parseDMYDate(value: string | undefined): number {
  if (!value) return 0;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return 0;
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day
    ? date.getTime()
    : 0;
}

export function getRecordValueByKey(record: PdsRecord, key: string): any {
  if (!record) return '';

  const p = record.personalInfo || {};

  // 1. Sex / Civil Status / Citizenship checkboxes (derived booleans, not stored directly)
  const civilStatusCheckboxKeys: Record<string, string[]> = {
    civilStatus_single: ['Single'],
    civilStatus_married: ['Married'],
    civilStatus_widowed: ['Widow/er'],
    civilStatus_separated: ['Separated'],
    civilStatus_others: ['Others', 'Solo Parent'],
  };
  switch (key) {
    case 'sexAtBirth_male':
      return p.sexAtBirth === 'Male';
    case 'sexAtBirth_female':
      return p.sexAtBirth === 'Female';
    case 'citizenship_filipino':
      return p.citizenship === 'Filipino';
    case 'citizenship_dual':
      return p.citizenship === 'Dual Citizenship';
    case 'dualCitizenship_byBirth':
      return p.dualCitizenshipMode === 'by birth';
    case 'dualCitizenship_byNaturalization':
      return p.dualCitizenshipMode === 'by naturalization';
    case 'signature':
    case 'signature_page4':
      return record.declaration?.signature ?? '';
    case 'declaration_dateAndPlaceOfIssuance': {
      const d = record.declaration;
      return d ? [d.dateOfIssuance, d.placeOfIssuance].filter(Boolean).join(', ') : '';
    }
    default:
      if (key in civilStatusCheckboxKeys) {
        return civilStatusCheckboxKeys[key].includes(p.civilStatus as string);
      }
  }

  // Government Issued ID (Declaration section)
  if (key.startsWith('declaration_') || key.startsWith('declaration.')) {
    const subKey = key.replace(/^declaration[_.]/, '');
    return record.declaration ? (record.declaration as any)[subKey] ?? '' : '';
  }

  // 2. Direct personalInfo property
  if (key in p) {
    return (p as any)[key];
  }

  // 3. Residential Address prefix
  if (key.startsWith('residentialAddress_') || key.startsWith('residentialAddress.')) {
    const subKey = key.replace(/^residentialAddress[_.]/, '');
    return p.residentialAddress ? (p.residentialAddress as any)[subKey] ?? '' : '';
  }

  // 4. Permanent Address prefix (fallback to residential if sameAsResidentialAddress)
  if (key.startsWith('permanentAddress_') || key.startsWith('permanentAddress.')) {
    const subKey = key.replace(/^permanentAddress[_.]/, '');
    if (p.sameAsResidentialAddress && p.residentialAddress) {
      return (p.residentialAddress as any)[subKey] ?? '';
    }
    return p.permanentAddress ? (p.permanentAddress as any)[subKey] ?? '' : '';
  }

  // 5. Family Background spouse/father/mother/children
  const f = record.familyBackground || {};
  if (key.startsWith('spouse_') || key.startsWith('spouse.')) {
    const subKey = key.replace(/^spouse[_.]/, '');
    return f.spouse ? (f.spouse as any)[subKey] ?? '' : '';
  }
  if (key.startsWith('father_') || key.startsWith('father.')) {
    const subKey = key.replace(/^father[_.]/, '');
    return f.father ? (f.father as any)[subKey] ?? '' : '';
  }
  if (key.startsWith('mother_') || key.startsWith('mother.')) {
    const subKey = key.replace(/^mother[_.]/, '');
    return f.mother ? (f.mother as any)[subKey] ?? '' : '';
  }

  // Children (1-based, zero-padded index): children_01_fullName, children_01_dateOfBirth, ... children_13_...
  const childMatch = key.match(/^children_(\d{2})_(fullName|dateOfBirth)$/);
  if (childMatch) {
    const child = f.children?.[parseInt(childMatch[1], 10) - 1];
    return child ? (child as any)[childMatch[2]] ?? '' : '';
  }

  // Civil Service Eligibility (1-based, zero-padded index): eligibility_01_rating, ... eligibility_07_...
  const eligibilityMatch = key.match(
    /^eligibility_(\d{2})_(careerServiceRA1080OrSpecialLaw|rating|dateOfExamConferment|placeOfExamConferment|licenseNumber|licenseValidityDate)$/
  );
  if (eligibilityMatch) {
    const entry = record.eligibility?.[parseInt(eligibilityMatch[1], 10) - 1];
    return entry ? (entry as any)[eligibilityMatch[2]] ?? '' : '';
  }

  // Work Experience (1-based, zero-padded index): workExperience_01_positionTitle, ... workExperience_24_...
  const workExperienceMatch = key.match(
    /^workExperience_(\d{2})_(inclusiveDatesFrom|inclusiveDatesTo|positionTitle|departmentAgencyOfficeCompany|monthlySalary|salaryJobPayGradeStepIncrement|statusOfAppointment|isGovernmentService)$/
  );
  if (workExperienceMatch) {
    const sortedWorkExperience = [...(record.workExperience ?? [])].sort((first, second) => {
      if (first.isPresent !== second.isPresent) return first.isPresent ? -1 : 1;
      const firstDate = parseDMYDate(first.inclusiveDatesTo) || parseDMYDate(first.inclusiveDatesFrom);
      const secondDate = parseDMYDate(second.inclusiveDatesTo) || parseDMYDate(second.inclusiveDatesFrom);
      return secondDate - firstDate;
    });
    const entry = sortedWorkExperience[parseInt(workExperienceMatch[1], 10) - 1];
    if (!entry) return '';
    const subKey = workExperienceMatch[2];
    if (subKey === 'inclusiveDatesTo' && entry.isPresent) return 'PRESENT';
    if (subKey === 'isGovernmentService') {
      const isGov = (entry as any)[subKey];
      return isGov === true ? 'Y' : isGov === false ? 'N' : '';
    }
    return (entry as any)[subKey] ?? '';
  }

  // Learning and Development / Trainings (1-based, zero-padded index): trainings_01_title, ... trainings_17_...
  const trainingMatch = key.match(
    /^trainings_(\d{2})_(title|inclusiveDatesFrom|inclusiveDatesTo|numberOfHours|typeOfLD|conductedSponsoredBy)$/
  );
  if (trainingMatch) {
    const sortedTrainings = [...(record.trainings ?? [])].sort((first, second) => {
      const firstDate = parseDMYDate(first.inclusiveDatesTo) || parseDMYDate(first.inclusiveDatesFrom);
      const secondDate = parseDMYDate(second.inclusiveDatesTo) || parseDMYDate(second.inclusiveDatesFrom);
      return secondDate - firstDate;
    });
    const entry = sortedTrainings[parseInt(trainingMatch[1], 10) - 1];
    return entry ? (entry as any)[trainingMatch[2]] ?? '' : '';
  }

  // Voluntary Work (1-based, zero-padded index): voluntaryWork_01_organizationNameAddress, ... voluntaryWork_09_...
  const voluntaryWorkMatch = key.match(
    /^voluntaryWork_(\d{2})_(organizationNameAddress|inclusiveDatesFrom|inclusiveDatesTo|numberOfHours|positionNatureOfWork)$/
  );
  if (voluntaryWorkMatch) {
    const entry = record.voluntaryWork?.[parseInt(voluntaryWorkMatch[1], 10) - 1];
    return entry ? (entry as any)[voluntaryWorkMatch[2]] ?? '' : '';
  }

  // Other Information lists (1-based, zero-padded index): otherInfo_hobbies_01, otherInfo_distinction_01, otherInfo_membership_01, ...
  const otherInfoListKeys: Record<string, keyof PdsRecord['otherInfo']> = {
    hobbies: 'specialSkillsHobbies',
    distinction: 'nonAcademicDistinctions',
    membership: 'membershipInAssociations',
  };
  const otherInfoMatch = key.match(/^otherInfo_(hobbies|distinction|membership)_(\d{2})$/);
  if (otherInfoMatch) {
    const list = record.otherInfo?.[otherInfoListKeys[otherInfoMatch[1]]] as string[] | undefined;
    return list?.[parseInt(otherInfoMatch[2], 10) - 1] ?? '';
  }

  // Background Questions (Items 34-40): backgroundQuestions_34a_y/n/details, ... backgroundQuestions_40c_...
  const backgroundQuestionKeyMap: Record<string, keyof PdsRecord['backgroundQuestions']> = {
    '34a': 'relatedWithinThirdDegree',
    '34b': 'relatedWithinFourthDegreeLGU',
    '35a': 'foundGuiltyOfAdminOffense',
    '35b': 'criminallyChargedInCourt',
    '36': 'convictedOfCrimeOrViolation',
    '37': 'separatedFromService',
    '38a': 'candidateInNationalLocalElection',
    '38b': 'resignedToCampaignForCandidate',
    '39': 'immigrantOrPermanentResidentAbroad',
    '40a': 'indigenousGroupMember',
    '40b': 'personWithDisability',
    '40c': 'soloParent',
  };
  // The specific sub-field each question uses to store its "If YES, give details" text.
  const backgroundQuestionDetailsKeyMap: Record<string, string> = {
    immigrantOrPermanentResidentAbroad: 'country',
    indigenousGroupMember: 'specify',
    personWithDisability: 'pwdIdNo',
    soloParent: 'soloParentIdNo',
  };
  const backgroundQuestionMatch = key.match(/^backgroundQuestions_(34a|34b|35a|35b|36|37|38a|38b|39|40a|40b|40c)_(y|n|details|dateFiled|statusOfCase)$/);
  if (backgroundQuestionMatch) {
    const questionKey = backgroundQuestionKeyMap[backgroundQuestionMatch[1]];
    const question = record.backgroundQuestions?.[questionKey] as any;
    if (!question) return backgroundQuestionMatch[2] === 'y' || backgroundQuestionMatch[2] === 'n' ? false : '';
    if (backgroundQuestionMatch[2] === 'y') return question.answer === true;
    if (backgroundQuestionMatch[2] === 'n') return question.answer === false;
    if (question.answer !== true) return '';
    if (backgroundQuestionMatch[2] === 'dateFiled') return question.dateFiled ?? '';
    if (backgroundQuestionMatch[2] === 'statusOfCase') return question.statusOfCase ?? '';
    const detailsKey = backgroundQuestionDetailsKeyMap[questionKey] ?? 'details';
    return question[detailsKey] ?? question.details ?? '';
  }

  // References (1-based, zero-padded index): references_01_name, ... references_03_...
  const referenceMatch = key.match(/^references_(\d{2})_(name|officeResidentialAddress|contactNoOrEmail)$/);
  if (referenceMatch) {
    const entry = record.references?.[parseInt(referenceMatch[1], 10) - 1];
    return entry ? (entry as any)[referenceMatch[2]] ?? '' : '';
  }

  // 6. Educational Background (elementary, secondary, vocationalTrade, college, graduateStudies)
  const edu = record.education || {};
  if (key.startsWith('elementary_') || key.startsWith('elementary.')) {
    const subKey = key.replace(/^elementary[_.]/, '');
    return edu.elementary ? (edu.elementary as any)[subKey] ?? '' : '';
  }
  if (key.startsWith('secondary_') || key.startsWith('secondary.')) {
    const subKey = key.replace(/^secondary[_.]/, '');
    return edu.secondary ? (edu.secondary as any)[subKey] ?? '' : '';
  }
  if (key.startsWith('vocationalTrade_') || key.startsWith('vocationalTrade.')) {
    const subKey = key.replace(/^vocationalTrade[_.]/, '');
    const entry = Array.isArray(edu.vocationalTrade) ? edu.vocationalTrade[0] : (edu.vocationalTrade as any);
    return entry ? (entry as any)[subKey] ?? '' : '';
  }
  if (key.startsWith('college_') || key.startsWith('college.')) {
    const subKey = key.replace(/^college[_.]/, '');
    const entry = Array.isArray(edu.college) ? edu.college[0] : (edu.college as any);
    return entry ? (entry as any)[subKey] ?? '' : '';
  }
  if (key.startsWith('graduateStudies_') || key.startsWith('graduateStudies.')) {
    const subKey = key.replace(/^graduateStudies[_.]/, '');
    const entry = Array.isArray(edu.graduateStudies) ? edu.graduateStudies[0] : (edu.graduateStudies as any);
    return entry ? (entry as any)[subKey] ?? '' : '';
  }

  // 7. Top-level property on record
  if (key in record) {
    return (record as any)[key];
  }

  return '';
}

/**
 * Decodes a base64 data URL (PNG or JPEG) and embeds it into the PDF document.
 */
async function embedDataUrlImage(pdfDoc: PDFDocument, dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? dataUrl;
  const imageBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return dataUrl.includes('image/png') ? pdfDoc.embedPng(imageBytes) : pdfDoc.embedJpg(imageBytes);
}

/**
 * Fetch the official PDF template buffer with fallback paths.
 */
async function fetchTemplateBuffer(): Promise<ArrayBuffer> {
  const candidateUrls = [
    '/pdf-templates/csc212-2026/pds.pdf',
    '/pdf-templates/csc212-2026/pds.pdf',
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.arrayBuffer();
      }
    } catch {
      // Try next candidate
    }
  }

  throw new Error(
    'Failed to load official PDS Page 1 template. Please ensure /public/pdf-templates/csc212-2026/pds.pdf is accessible.'
  );
}

export interface PdfExportResult {
  fileName: string;
  blob: Blob;
  bytes: Uint8Array;
}

/**
 * Fills PDS Page 1 official AcroForm PDF using pdf-lib.
 *
 * TODO: Section III (Educational background tables beyond the first entry per level)
 * and Pages 2-4 field mappings will be added incrementally as acroFields are expanded.
 */
export async function generatePdsPage1Pdf(record: PdsRecord): Promise<PdfExportResult> {
  console.info('[GovFormsPH PDF Export] Starting PDS Page 1 export with pdf-lib...');

  // 1. Fetch template
  const templateBuffer = await fetchTemplateBuffer();

  // 2. Load PDF Document
  const pdfDoc = await PDFDocument.load(templateBuffer);
  const form = pdfDoc.getForm();
  const defaultFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Index existing PDF fields by name for safe runtime lookup
  const pdfFieldsByName = new Map(form.getFields().map((f) => [f.getName(), f]));
  const pageRefByWidgetDict = new Map<PDFDict, any>();
  for (const page of pdfDoc.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i++) {
      const widgetDict = annots.lookupMaybe(i, PDFDict);
      if (widgetDict) pageRefByWidgetDict.set(widgetDict, page.ref);
    }
  }

  const acroFields: Record<string, string> = fieldMap.acroFields || {};
  const mappedCheckboxFields = new Set<PDFCheckBox>();
  const checkedCheckboxFields = new Set<PDFCheckBox>();
  let filledCount = 0;
  let skippedCount = 0;

  // 3. Iterate mapped fields
  for (const [appDataKey, pdfFieldName] of Object.entries(acroFields)) {
    const field = pdfFieldsByName.get(pdfFieldName);

    if (!field) {
      console.warn(
        `[GovFormsPH PDF Export] PDF field "${pdfFieldName}" for appKey "${appDataKey}" not found in template. Skipping.`
      );
      skippedCount++;
      continue;
    }

    const value = getRecordValueByKey(record, appDataKey);

    try {
      if (field instanceof PDFTextField) {
        fillAutoSizedTextField(form, pdfFieldName, value, { maxSize: 10, minSize: 6, font: defaultFont });
        filledCount++;
      } else if (field instanceof PDFCheckBox) {
        mappedCheckboxFields.add(field);
        if (value) {
          field.check();
          checkedCheckboxFields.add(field);
        } else {
          field.uncheck();
        }
        filledCount++;
      } else if (field instanceof PDFRadioGroup) {
        if (value) {
          field.select(String(value));
        }
        filledCount++;
      } else if (field instanceof PDFDropdown) {
        if (value) {
          field.select(String(value));
        }
        filledCount++;
      } else {
        console.warn(
          `[GovFormsPH PDF Export] Field "${pdfFieldName}" has unsupported type: ${field.constructor.name}`
        );
        skippedCount++;
      }
    } catch (fieldErr) {
      console.warn(
        `[GovFormsPH PDF Export] Error setting value on "${pdfFieldName}":`,
        fieldErr
      );
      skippedCount++;
    }
  }

  console.info(
    `[GovFormsPH PDF Export] Page 1 filled successfully. ${filledCount} fields populated, ${skippedCount} skipped.`
  );

  // 3b. Fill the print date field with today's date (not sourced from the record)
  if (pdfFieldsByName.get('pds_date') instanceof PDFTextField) {
    const now = new Date();
    const printedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    fillAutoSizedTextField(form, 'pds_date', printedDate, { maxSize: 10, minSize: 6, font: defaultFont });
  } else {
    console.warn('[GovFormsPH PDF Export] PDF field "pds_date" not found in template. Skipping print date.');
  }

  if (pdfFieldsByName.get('c4_sign_date') instanceof PDFTextField) {
    const now = new Date();
    const printedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    fillAutoSizedTextField(form, 'c4_sign_date', printedDate, { maxSize: 10, minSize: 6, font: defaultFont });
  } else {
    console.warn('[GovFormsPH PDF Export] PDF field "c4_sign_date" not found in template. Skipping print date.');
  }

  // 3c. Embed image fields onto push-button widgets.
  const imageFields = (fieldMap as { imageFields?: Record<string, string> }).imageFields ?? {};
  for (const [appDataKey, pdfFieldName] of Object.entries(imageFields)) {
    const field = pdfFieldsByName.get(pdfFieldName);
    const dataUrl = getRecordValueByKey(record, appDataKey);

    if (!field) {
      console.warn(`[GovFormsPH PDF Export] PDF field "${pdfFieldName}" for appKey "${appDataKey}" not found in template. Skipping.`);
      continue;
    }
    if (!dataUrl || typeof dataUrl !== 'string') continue;

    try {
      const image = await embedDataUrlImage(pdfDoc, dataUrl);
      if (field instanceof PDFButton) {
        field.setImage(image);
      } else {
        console.warn(`[GovFormsPH PDF Export] Field "${pdfFieldName}" is not an image/button field (got ${field.constructor.name}). Skipping.`);
        continue;
      }
      filledCount++;
    } catch (imageErr) {
      console.warn(`[GovFormsPH PDF Export] Error embedding image on "${pdfFieldName}":`, imageErr);
      skippedCount++;
    }
  }

  // 3d. Draw the passport-sized photo directly on the page (not a real AcroForm field)
  const photoCoord = (fieldMap.imageCoordinates || {}).photo;
  const photoDataUrl = record.declaration?.idPhoto;
  if (photoCoord && photoDataUrl) {
    try {
      const photoImage = await embedDataUrlImage(pdfDoc, photoDataUrl);
      const photoPage = pdfDoc.getPages()[photoCoord.page - 1];
      photoPage?.drawImage(photoImage, {
        x: photoCoord.x,
        y: photoCoord.y,
        width: photoCoord.width ?? photoImage.width,
        height: photoCoord.height ?? photoImage.height,
      });
      filledCount++;
    } catch (photoErr) {
      console.warn('[GovFormsPH PDF Export] Error drawing passport photo:', photoErr);
      skippedCount++;
    }
  }

  const signatureCoordinates = fieldMap.imageCoordinates as unknown as Record<
    'signature' | 'signature_page4',
    Array<{ page: number; x: number; y: number; width: number; height: number }>
  >;
  for (const appDataKey of ['signature', 'signature_page4'] as const) {
    const signatureCoords = signatureCoordinates[appDataKey];
    const signatureDataUrl = getRecordValueByKey(record, appDataKey);
    if (!signatureCoords || !signatureDataUrl || typeof signatureDataUrl !== 'string') continue;

    try {
      const signatureImage = await embedDataUrlImage(pdfDoc, signatureDataUrl);
      for (const signatureCoord of signatureCoords) {
        const signaturePage = pdfDoc.getPages()[signatureCoord.page - 1];
        if (!signaturePage) continue;

        const dimensions = signatureImage.scaleToFit(signatureCoord.width, signatureCoord.height);
        signaturePage.drawImage(signatureImage, {
          x: signatureCoord.x + (signatureCoord.width - dimensions.width) / 2,
          y: signatureCoord.y + (signatureCoord.height - dimensions.height) / 2,
          width: dimensions.width,
          height: dimensions.height,
        });
      }
      filledCount++;
    } catch (signatureErr) {
      console.warn(`[GovFormsPH PDF Export] Error drawing signature "${appDataKey}":`, signatureErr);
      skippedCount++;
    }
  }

  // Sejda checkboxes do not reliably retain their appearance after flattening.
  // Draw a static X for every checked mapped field, then remove those widgets from the form.
  const pagesByRef = new Map(pdfDoc.getPages().map((page) => [page.ref.toString(), page]));
  for (const field of checkedCheckboxFields) {
    for (const widget of field.acroField.getWidgets()) {
      const pageRef = widget.P() ?? pageRefByWidgetDict.get(widget.dict);
      const page = pageRef ? pagesByRef.get(pageRef.toString()) : undefined;
      if (!page) continue;

      const rectangle = widget.getRectangle();
      const inset = Math.min(rectangle.width, rectangle.height) * 0.18;
      page.drawLine({
        start: { x: rectangle.x + inset, y: rectangle.y + inset },
        end: { x: rectangle.x + rectangle.width - inset, y: rectangle.y + rectangle.height - inset },
        thickness: 0.8,
      });
      page.drawLine({
        start: { x: rectangle.x + inset, y: rectangle.y + rectangle.height - inset },
        end: { x: rectangle.x + rectangle.width - inset, y: rectangle.y + inset },
        thickness: 0.8,
      });
    }
  }

  // Sejda signature widgets lack appearance streams, which causes pdf-lib flattening to abort.
  // PDFForm.removeField() also reads that missing appearance, so detach the fields directly.
  for (const fieldName of ['pds_sign', 'c4_sign']) {
    const field = pdfFieldsByName.get(fieldName);
    if (field) form.acroForm.removeField(field.acroField);
  }
  for (const field of mappedCheckboxFields) {
    form.acroForm.removeField(field.acroField);
  }

  // 4. Flatten form fields to make content static
  // Ensure all widgets have a valid page reference (/P) so pdf-lib flatten never throws orphaned ref errors.
  // Widgets missing /P are matched to their real page via each page's /Annots array first,
  // so multi-page templates don't have every unset widget collapse onto page 1.
  const pages = pdfDoc.getPages();
  const defaultPageRef = pages[0]?.ref;
  if (defaultPageRef) {
    for (const field of form.getFields()) {
      try {
        for (const widget of field.acroField.getWidgets()) {
          if (!widget.P()) {
            const pageRef = pageRefByWidgetDict.get(widget.dict) ?? defaultPageRef;
            widget.dict.set(PDFName.of('P'), pageRef);
          }
        }
      } catch {
        // Continue if field has no widgets
      }
    }
  }

  try {
    form.flatten();
  } catch (flattenErr) {
    console.warn('[GovFormsPH PDF Export] Note: Partial form flattening warning:', flattenErr);
  }

  // 5. Save final PDF bytes
  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  const surname = record.personalInfo?.surname?.trim() || 'PDS';
  const firstName = record.personalInfo?.firstName?.trim() || '';
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = [surname, firstName].filter(Boolean).join('_').replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `CS-Form-212-2026-Page1_${safeName}_${dateStr}.pdf`;

  return { fileName, blob, bytes };
}

/**
 * Opens the filled PDF in a new browser tab.
 */
export async function openPdsPage1PdfInNewTab(record: PdsRecord): Promise<void> {
  const { blob } = await generatePdsPage1Pdf(record);
  const url = URL.createObjectURL(blob);

  // Attempt window.open in a new tab
  const newWindow = window.open(url, '_blank');

  // Fallback if popup blocker intercepted window.open
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Triggers a client-side file download for the filled PDF.
 */
export async function downloadPdsPage1Pdf(record: PdsRecord): Promise<void> {
  const { fileName, blob } = await generatePdsPage1Pdf(record);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
