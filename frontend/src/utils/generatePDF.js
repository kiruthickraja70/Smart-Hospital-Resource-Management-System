import jsPDF from 'jspdf';

export const generatePrescriptionPDF = (prescription) => {
  const doc = new jsPDF();
  const { patient, doctor, diagnosis, medications, notes, followUpDate, createdAt } = prescription;

  doc.setFillColor(13, 110, 253);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Smart Hospital', 105, 15, { align: 'center' });
  doc.setFontSize(11);
  doc.text('Medical Prescription', 105, 25, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  let y = 45;

  doc.setFont(undefined, 'bold');
  doc.text(`Date: ${new Date(createdAt).toLocaleDateString()}`, 20, y);
  y += 10;

  doc.setFontSize(12);
  doc.text('Doctor Information', 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Dr. ${doctor.name}`, 20, y);
  y += 5;
  doc.text(`${doctor.department} | ${doctor.specialization}`, 20, y);
  if (doctor.qualification) {
    y += 5;
    doc.text(doctor.qualification, 20, y);
  }
  y += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Patient Information', 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${patient.name}`, 20, y);
  y += 5;
  if (patient.bloodGroup) doc.text(`Blood Group: ${patient.bloodGroup}`, 20, y);
  y += 5;
  doc.text(`Phone: ${patient.phone}`, 20, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Diagnosis', 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const diagnosisLines = doc.splitTextToSize(diagnosis, 170);
  doc.text(diagnosisLines, 20, y);
  y += diagnosisLines.length * 5 + 8;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Medications', 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  medications.forEach((med, i) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${i + 1}. ${med.name} - ${med.dosage}`, 25, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    doc.text(`   Frequency: ${med.frequency} | Duration: ${med.duration}`, 25, y);
    y += 5;
    if (med.instructions) {
      doc.text(`   Instructions: ${med.instructions}`, 25, y);
      y += 5;
    }
    y += 3;
  });

  if (notes) {
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', 20, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    const noteLines = doc.splitTextToSize(notes, 170);
    doc.text(noteLines, 20, y);
    y += noteLines.length * 5;
  }

  if (followUpDate) {
    y += 8;
    doc.setFont(undefined, 'bold');
    doc.text(`Follow-up Date: ${new Date(followUpDate).toLocaleDateString()}`, 20, y);
  }

  doc.setDrawColor(200);
  doc.line(20, 270, 190, 270);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('This is a computer-generated prescription. Smart Hospital Resource Management System.', 105, 278, { align: 'center' });

  doc.save(`prescription_${patient.name.replace(/\s/g, '_')}_${new Date(createdAt).toISOString().split('T')[0]}.pdf`);
};
