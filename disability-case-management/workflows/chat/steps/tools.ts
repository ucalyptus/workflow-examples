import { FatalError } from 'workflow';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Time constants for better readability
const DAYS_TO_MS = 24 * 60 * 60 * 1000;

// Mock data for case statuses and types
export const caseStatuses = [
  'Pending Review',
  'Under Investigation',
  'Documentation Required',
  'Awaiting Medical Records',
  'Scheduled for Hearing',
  'Approved',
  'Denied',
  'Appeal Filed',
  'Closed',
] as const;

export const disabilityTypes = [
  'Physical Disability',
  'Mental Health Condition',
  'Intellectual Disability',
  'Sensory Impairment',
  'Chronic Illness',
  'Multiple Disabilities',
] as const;

export const mockCaseworkers: Record<
  string,
  { name: string; department: string; caseload: number; specialty: string }
> = {
  CW001: {
    name: 'Sarah Johnson',
    department: 'Disability Services',
    caseload: 45,
    specialty: 'Physical Disabilities',
  },
  CW002: {
    name: 'Michael Chen',
    department: 'Disability Services',
    caseload: 38,
    specialty: 'Mental Health',
  },
  CW003: {
    name: 'Emily Rodriguez',
    department: 'Appeals Division',
    caseload: 52,
    specialty: 'Appeals & Reviews',
  },
  CW004: {
    name: 'James Williams',
    department: 'Medical Review',
    caseload: 41,
    specialty: 'Medical Documentation',
  },
  CW005: {
    name: 'Lisa Thompson',
    department: 'Disability Services',
    caseload: 35,
    specialty: 'Intellectual Disabilities',
  },
};

/** Create a new disability case */
export async function createCase({
  applicantName,
  dateOfBirth,
  disabilityType,
  description,
}: {
  applicantName: string;
  dateOfBirth: string;
  disabilityType: string;
  description: string;
}) {
  'use step';

  console.log(`Creating disability case for ${applicantName}`);

  // Simulate processing
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Generate case ID using nanoid for uniqueness
  const caseId = `DC${nanoid(10).toUpperCase()}`;
  const filingDate = new Date().toISOString();
  
  // Assign a caseworker based on disability type
  const caseworkerIds = Object.keys(mockCaseworkers);
  const assignedCaseworkerId = caseworkerIds[Math.floor(Math.random() * caseworkerIds.length)];
  const assignedCaseworker = mockCaseworkers[assignedCaseworkerId];

  return {
    success: true,
    caseId,
    applicantName,
    dateOfBirth,
    disabilityType,
    description,
    status: 'Pending Review',
    filingDate,
    assignedCaseworker: {
      id: assignedCaseworkerId,
      name: assignedCaseworker.name,
      department: assignedCaseworker.department,
    },
    nextSteps: [
      'Complete initial application review',
      'Submit medical documentation',
      'Schedule initial consultation',
    ],
    message: `Case ${caseId} created successfully. Your assigned caseworker is ${assignedCaseworker.name}.`,
  };
}

/** Check the status of a disability case */
export async function checkCaseStatus({ caseId }: { caseId: string }) {
  'use step';

  console.log(`Checking status for case ${caseId}`);

  // 10% chance of error to demonstrate retry
  if (Math.random() < 0.1) {
    throw new Error('Case management system temporarily unavailable');
  }

  // Simulate processing
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate random case details
  const status = caseStatuses[Math.floor(Math.random() * caseStatuses.length)];
  const disabilityType = disabilityTypes[Math.floor(Math.random() * disabilityTypes.length)];
  const caseworkerIds = Object.keys(mockCaseworkers);
  const assignedCaseworkerId = caseworkerIds[Math.floor(Math.random() * caseworkerIds.length)];
  const assignedCaseworker = mockCaseworkers[assignedCaseworkerId];

  // Generate dates using named constants
  const filingDate = new Date(Date.now() - Math.random() * 180 * DAYS_TO_MS); // Within last 6 months
  const lastUpdated = new Date(Date.now() - Math.random() * 14 * DAYS_TO_MS); // Within last 2 weeks
  
  // Estimated completion based on status
  const estimatedCompletion = status === 'Approved' || status === 'Denied' || status === 'Closed'
    ? null
    : new Date(Date.now() + Math.random() * 90 * DAYS_TO_MS);

  return {
    caseId: caseId.toUpperCase(),
    status,
    disabilityType,
    filingDate: filingDate.toISOString(),
    lastUpdated: lastUpdated.toISOString(),
    estimatedCompletion: estimatedCompletion?.toISOString() || 'N/A - Case concluded',
    assignedCaseworker: {
      id: assignedCaseworkerId,
      name: assignedCaseworker.name,
      department: assignedCaseworker.department,
      phone: '(555) 000-' + String(Math.floor(Math.random() * 9000 + 1000)),
    },
    pendingActions: status === 'Documentation Required'
      ? ['Submit medical records', 'Complete employment history form']
      : status === 'Scheduled for Hearing'
        ? ['Prepare for hearing', 'Review case documents']
        : ['None - awaiting processing'],
  };
}

/** Update case information */
export async function updateCase({
  caseId,
  updateType,
  details,
}: {
  caseId: string;
  updateType: string;
  details: string;
}) {
  'use step';

  console.log(`Updating case ${caseId}: ${updateType}`);

  // Simulate processing
  await new Promise((resolve) => setTimeout(resolve, 600));

  // 5% chance of update failure
  if (Math.random() < 0.05) {
    throw new FatalError(
      'Unable to update case. The case may be locked for review. Please contact your caseworker.'
    );
  }

  const updateId = `UPD${nanoid(8).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  return {
    success: true,
    updateId,
    caseId: caseId.toUpperCase(),
    updateType,
    details,
    timestamp,
    message: `Case ${caseId} updated successfully. Update reference: ${updateId}`,
    nextSteps: updateType === 'Medical Documentation'
      ? ['Documentation will be reviewed within 5-7 business days']
      : updateType === 'Contact Information'
        ? ['Your caseworker will be notified of the change']
        : ['Update has been recorded and will be processed'],
  };
}

/** Assign or reassign a caseworker */
export async function assignCaseworker({
  caseId,
  reason,
  preferredSpecialty,
}: {
  caseId: string;
  reason?: string;
  preferredSpecialty?: string;
}) {
  'use step';

  console.log(`Assigning caseworker for case ${caseId}`);

  // Simulate processing
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Find caseworker based on specialty preference or lowest caseload
  let selectedCaseworker: { id: string; info: typeof mockCaseworkers[string] } | null = null;

  if (preferredSpecialty) {
    const matching = Object.entries(mockCaseworkers).find(
      ([, info]) => info.specialty.toLowerCase().includes(preferredSpecialty.toLowerCase())
    );
    if (matching) {
      selectedCaseworker = { id: matching[0], info: matching[1] };
    }
  }

  if (!selectedCaseworker) {
    // Assign caseworker with lowest caseload
    const [id, info] = Object.entries(mockCaseworkers).reduce((prev, current) =>
      prev[1].caseload < current[1].caseload ? prev : current
    );
    selectedCaseworker = { id, info };
  }

  return {
    success: true,
    caseId: caseId.toUpperCase(),
    assignedCaseworker: {
      id: selectedCaseworker.id,
      name: selectedCaseworker.info.name,
      department: selectedCaseworker.info.department,
      specialty: selectedCaseworker.info.specialty,
      currentCaseload: selectedCaseworker.info.caseload,
    },
    reason: reason || 'Standard assignment',
    assignmentDate: new Date().toISOString(),
    message: `Case ${caseId} has been assigned to ${selectedCaseworker.info.name}. They will contact you within 2-3 business days.`,
  };
}

/** Add documentation to a case */
export async function addDocumentation({
  caseId,
  documentType,
  description,
  issuingAuthority,
}: {
  caseId: string;
  documentType: string;
  description: string;
  issuingAuthority?: string;
}) {
  'use step';

  console.log(`Adding documentation to case ${caseId}: ${documentType}`);

  // Simulate processing
  await new Promise((resolve) => setTimeout(resolve, 500));

  const documentId = `DOC${nanoid(8).toUpperCase()}`;
  const uploadDate = new Date().toISOString();

  return {
    success: true,
    documentId,
    caseId: caseId.toUpperCase(),
    documentType,
    description,
    issuingAuthority: issuingAuthority || 'Not specified',
    uploadDate,
    status: 'Pending Review',
    message: `Document ${documentId} has been added to case ${caseId}. It will be reviewed within 3-5 business days.`,
    requiredActions: documentType === 'Medical Records'
      ? ['Ensure all pages are legible', 'Include physician signature']
      : documentType === 'Employment History'
        ? ['Verify dates of employment', 'Include job descriptions']
        : ['No additional actions required'],
  };
}

/** Schedule an appointment */
export async function scheduleAppointment({
  caseId,
  appointmentType,
  preferredDate,
  preferredTime,
  notes,
}: {
  caseId: string;
  appointmentType: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}) {
  'use step';

  console.log(`Scheduling ${appointmentType} for case ${caseId}`);

  // Simulate processing
  await new Promise((resolve) => setTimeout(resolve, 600));

  // 10% chance of scheduling conflict
  if (Math.random() < 0.1) {
    throw new Error('Scheduling conflict. Please try a different date or time.');
  }

  const appointmentId = `APT${nanoid(8).toUpperCase()}`;
  
  // Generate appointment date (preferredDate or random future date)
  let appointmentDate: Date;
  if (preferredDate) {
    appointmentDate = new Date(preferredDate);
  } else {
    appointmentDate = new Date(Date.now() + (7 + Math.random() * 21) * DAYS_TO_MS);
  }

  // Set time
  const hours = preferredTime
    ? parseInt(preferredTime.split(':')[0])
    : 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
  appointmentDate.setHours(hours, preferredTime ? parseInt(preferredTime.split(':')[1]) : 0);

  // Determine location based on appointment type
  const locations = {
    'Initial Consultation': 'Main Office - Room 201',
    'Medical Examination': 'Medical Center - Suite 105',
    'Hearing': 'Administrative Hearings Office - Hearing Room A',
    'Document Review': 'Virtual (Zoom link will be sent)',
    'Appeal Review': 'Appeals Division - Conference Room B',
  };

  const location = locations[appointmentType as keyof typeof locations] || 'Main Office - Room 101';

  return {
    success: true,
    appointmentId,
    caseId: caseId.toUpperCase(),
    appointmentType,
    dateTime: appointmentDate.toISOString(),
    location,
    duration: appointmentType === 'Hearing' ? '60 minutes' : '30 minutes',
    notes: notes || 'None',
    message: `Appointment ${appointmentId} scheduled successfully for ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}.`,
    preparationInstructions: appointmentType === 'Medical Examination'
      ? ['Bring photo ID', 'Bring current medications list', 'Arrive 15 minutes early']
      : appointmentType === 'Hearing'
        ? ['Bring all supporting documents', 'Review case summary', 'Legal representation is allowed']
        : ['Bring photo ID', 'Bring any relevant documents'],
  };
}

/** Get eligibility criteria information */
export async function getEligibilityCriteria({ disabilityType }: { disabilityType: string }) {
  'use step';

  console.log(`Getting eligibility criteria for ${disabilityType}`);

  const criteria: Record<string, { requirements: string[]; documentation: string[]; processingTime: string }> = {
    'Physical Disability': {
      requirements: [
        'Medical documentation of physical impairment',
        'Impact on daily activities must be demonstrated',
        'Impairment expected to last 12+ months or result in death',
        'Unable to perform substantial gainful activity',
      ],
      documentation: [
        'Medical records from treating physicians',
        'Diagnostic test results (X-rays, MRIs, etc.)',
        'Functional capacity evaluation',
        'Employment history and job descriptions',
      ],
      processingTime: '3-6 months',
    },
    'Mental Health Condition': {
      requirements: [
        'Documented mental health diagnosis',
        'Treatment history of at least 6 months',
        'Functional limitations in work or daily activities',
        'Evidence that condition limits ability to work',
      ],
      documentation: [
        'Psychiatric evaluation',
        'Treatment records and medication history',
        'Psychological testing results',
        'Statement from mental health provider',
      ],
      processingTime: '4-8 months',
    },
    'Intellectual Disability': {
      requirements: [
        'IQ score documentation',
        'Evidence of onset before age 22',
        'Significant limitations in adaptive functioning',
        'School or institutional records',
      ],
      documentation: [
        'Psychological evaluation',
        'Educational records',
        'Adaptive behavior assessment',
        'Historical medical records',
      ],
      processingTime: '3-5 months',
    },
    'Sensory Impairment': {
      requirements: [
        'Documentation of vision or hearing loss',
        'Specialist medical evaluation',
        'Impact on work capacity demonstrated',
        'Best corrected measurements required',
      ],
      documentation: [
        'Ophthalmologist or audiologist reports',
        'Visual field or audiometric testing',
        'Functional vision/hearing assessment',
        'Assistive device records',
      ],
      processingTime: '2-4 months',
    },
    'Chronic Illness': {
      requirements: [
        'Documented diagnosis of chronic condition',
        'Evidence of ongoing treatment',
        'Functional limitations documentation',
        'Prognosis from treating physician',
      ],
      documentation: [
        'Treatment records spanning 12+ months',
        'Laboratory and diagnostic test results',
        'Medication and side effects documentation',
        'Hospitalization records if applicable',
      ],
      processingTime: '4-7 months',
    },
    'Multiple Disabilities': {
      requirements: [
        'Documentation for each disability',
        'Combined impact assessment',
        'Evidence of functional limitations from each condition',
        'Comprehensive medical evaluation',
      ],
      documentation: [
        'Medical records for all conditions',
        'Specialist evaluations for each disability',
        'Comprehensive functional assessment',
        'Combined treatment plan documentation',
      ],
      processingTime: '5-9 months',
    },
  };

  const normalizedType = Object.keys(criteria).find(
    (key) => key.toLowerCase().includes(disabilityType.toLowerCase())
  ) || 'Physical Disability';

  const info = criteria[normalizedType];

  return {
    disabilityType: normalizedType,
    requirements: info.requirements,
    requiredDocumentation: info.documentation,
    estimatedProcessingTime: info.processingTime,
    additionalInfo: 'All documentation must be dated within the last 12 months unless otherwise specified.',
    helplineNumber: '1-800-555-HELP (4357)',
    onlinePortal: 'https://disability-services.example.gov',
  };
}

// Tool definitions
export const caseManagementTools = {
  createCase: {
    description:
      'Create a new disability case for an applicant seeking benefits or services',
    inputSchema: z.object({
      applicantName: z.string().describe('Full legal name of the applicant'),
      dateOfBirth: z.string().describe('Date of birth in YYYY-MM-DD format'),
      disabilityType: z.string().describe('Type of disability (e.g., Physical Disability, Mental Health Condition, Intellectual Disability, Sensory Impairment, Chronic Illness, Multiple Disabilities)'),
      description: z.string().describe('Brief description of the disability and how it affects daily life'),
    }),
    execute: createCase,
  },
  checkCaseStatus: {
    description: 'Check the current status of an existing disability case',
    inputSchema: z.object({
      caseId: z.string().describe('The case ID (e.g., DC123ABC)'),
    }),
    execute: checkCaseStatus,
  },
  updateCase: {
    description: 'Update information or add notes to an existing case',
    inputSchema: z.object({
      caseId: z.string().describe('The case ID to update'),
      updateType: z.string().describe('Type of update (e.g., Contact Information, Medical Documentation, Employment Status, Additional Notes)'),
      details: z.string().describe('Details of the update'),
    }),
    execute: updateCase,
  },
  assignCaseworker: {
    description: 'Request assignment or reassignment of a caseworker for a case',
    inputSchema: z.object({
      caseId: z.string().describe('The case ID'),
      reason: z.string().optional().describe('Reason for assignment/reassignment request'),
      preferredSpecialty: z.string().optional().describe('Preferred caseworker specialty (e.g., Physical Disabilities, Mental Health, Appeals)'),
    }),
    execute: assignCaseworker,
  },
  addDocumentation: {
    description: 'Add supporting documentation to a disability case',
    inputSchema: z.object({
      caseId: z.string().describe('The case ID'),
      documentType: z.string().describe('Type of document (e.g., Medical Records, Employment History, Physician Statement, Diagnostic Report)'),
      description: z.string().describe('Description of the document contents'),
      issuingAuthority: z.string().optional().describe('Organization or person who issued the document'),
    }),
    execute: addDocumentation,
  },
  scheduleAppointment: {
    description: 'Schedule an appointment related to a disability case',
    inputSchema: z.object({
      caseId: z.string().describe('The case ID'),
      appointmentType: z.string().describe('Type of appointment (Initial Consultation, Medical Examination, Hearing, Document Review, Appeal Review)'),
      preferredDate: z.string().optional().describe('Preferred date in YYYY-MM-DD format'),
      preferredTime: z.string().optional().describe('Preferred time in HH:MM format'),
      notes: z.string().optional().describe('Any additional notes or accessibility requirements'),
    }),
    execute: scheduleAppointment,
  },
  getEligibilityCriteria: {
    description: 'Get eligibility criteria and required documentation for a specific disability type',
    inputSchema: z.object({
      disabilityType: z.string().describe('Type of disability to get criteria for'),
    }),
    execute: getEligibilityCriteria,
  },
};

// System prompt
export const CASE_MANAGEMENT_ASSISTANT_PROMPT = `You are a helpful and compassionate disability case management assistant. You help applicants and caseworkers with:
- Creating new disability benefit cases
- Checking the status of existing cases
- Updating case information
- Assigning or reassigning caseworkers
- Adding documentation to cases
- Scheduling appointments (consultations, examinations, hearings)
- Understanding eligibility criteria for different disability types

Be empathetic, professional, and thorough. When creating new cases, ensure you have all required information.
When checking case status, explain what each status means and what the next steps are.
Always provide clear guidance on required documentation and timelines.
If an applicant seems distressed, acknowledge their feelings and provide reassurance about the process.

Important: Always protect applicant privacy. Do not share case details without proper verification.`;
