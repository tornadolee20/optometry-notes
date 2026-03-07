import jsPDF from 'jspdf';
import { VisionTherapyProtocol, getPatternDisplayName } from './therapyProtocol';

// Generate therapy manual PDF
export async function generateTherapyManualPdf(
  protocol: VisionTherapyProtocol,
  patientInfo?: {
    patientCode?: string;
    age?: number;
    examDate?: string;
    clinicName?: string;
    optometristName?: string;
  }
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper function to check and add new page
  const checkNewPage = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to draw horizontal line
  const drawLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
  };

  // Helper to wrap text
  const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number, isBold = false) => {
    doc.setFontSize(fontSize);
    // Note: jsPDF doesn't have great CJK support, using basic font
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkNewPage(fontSize * 0.4);
      doc.text(line, x, yPos);
      yPos += fontSize * 0.45;
    });
  };

  // === Cover Page ===
  doc.setFontSize(28);
  doc.setTextColor(41, 98, 255);
  doc.text('Vision Therapy', pageWidth / 2, 60, { align: 'center' });
  doc.text('Training Manual', pageWidth / 2, 75, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(100, 100, 100);
  doc.text('視覺訓練手冊', pageWidth / 2, 95, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text(getPatternDisplayName(protocol.pattern), pageWidth / 2, 120, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`Total Duration: ${protocol.totalWeeks} Weeks`, pageWidth / 2, 140, { align: 'center' });
  doc.text(`總療程：${protocol.totalWeeks} 週`, pageWidth / 2, 150, { align: 'center' });

  // Patient info if available
  if (patientInfo) {
    yPos = 180;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    
    if (patientInfo.patientCode) {
      doc.text(`Patient Code / 病歷號：${patientInfo.patientCode}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }
    if (patientInfo.age) {
      doc.text(`Age / 年齡：${patientInfo.age}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }
    if (patientInfo.examDate) {
      doc.text(`Exam Date / 檢查日期：${patientInfo.examDate}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }
    if (patientInfo.clinicName) {
      doc.text(`Clinic / 診所：${patientInfo.clinicName}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }
    if (patientInfo.optometristName) {
      doc.text(`Optometrist / 驗光師：${patientInfo.optometristName}`, pageWidth / 2, yPos, { align: 'center' });
    }
  }

  // Footer on cover
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

  // === Content Pages ===
  doc.addPage();
  yPos = margin;

  // Table of Contents
  doc.setFontSize(18);
  doc.setTextColor(41, 98, 255);
  doc.text('Table of Contents', margin, yPos);
  doc.text('目錄', margin + 80, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  protocol.phases.forEach((phase, idx) => {
    doc.text(`${idx + 1}. ${phase.phaseName} (${phase.weeks})`, margin + 5, yPos);
    yPos += 7;
  });
  
  doc.text(`${protocol.phases.length + 1}. Home Therapy Notes / 居家訓練注意事項`, margin + 5, yPos);
  yPos += 20;
  
  drawLine();

  // === Training Phases ===
  protocol.phases.forEach((phase, phaseIndex) => {
    checkNewPage(60);
    
    // Phase Header
    doc.setFontSize(16);
    doc.setTextColor(41, 98, 255);
    doc.text(`Phase ${phaseIndex + 1}: ${phase.phaseName}`, margin, yPos);
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(phase.weeks, margin, yPos);
    yPos += 10;

    // Goals
    doc.setFontSize(12);
    doc.setTextColor(34, 139, 34);
    doc.text('Goals / 訓練目標:', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    phase.goals.forEach((goal) => {
      checkNewPage(8);
      doc.text(`• ${goal}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 5;

    // Exercises
    phase.exercises.forEach((exercise, exIndex) => {
      checkNewPage(50);
      
      // Exercise header
      doc.setFontSize(12);
      doc.setTextColor(41, 98, 255);
      doc.text(`Exercise ${exIndex + 1}: ${exercise.name}`, margin, yPos);
      if (exercise.nameEn) {
        doc.setTextColor(100, 100, 100);
        doc.text(`(${exercise.nameEn})`, margin + doc.getTextWidth(`Exercise ${exIndex + 1}: ${exercise.name}`) + 3, yPos);
      }
      yPos += 7;

      // Difficulty badge
      doc.setFontSize(9);
      const difficultyText = exercise.difficulty === 'easy' ? 'Easy / 簡單' : 
                             exercise.difficulty === 'medium' ? 'Medium / 中等' : 'Hard / 困難';
      const difficultyColor = exercise.difficulty === 'easy' ? [34, 139, 34] : 
                              exercise.difficulty === 'medium' ? [255, 165, 0] : [220, 20, 60];
      doc.setTextColor(difficultyColor[0], difficultyColor[1], difficultyColor[2]);
      doc.text(`[${difficultyText}]`, margin, yPos);
      yPos += 8;

      // Exercise details
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      // Description
      addWrappedText(exercise.description, margin + 5, contentWidth - 10, 10);
      yPos += 3;

      // Parameters in table format
      doc.setFontSize(9);
      const params = [
        { label: 'Frequency / 頻率', value: exercise.frequency },
        { label: 'Duration / 時長', value: exercise.duration },
        { label: 'Target / 目標', value: exercise.target },
        { label: 'Progression / 進度', value: exercise.progression }
      ];

      params.forEach(param => {
        checkNewPage(6);
        doc.setTextColor(100, 100, 100);
        doc.text(`${param.label}:`, margin + 5, yPos);
        doc.setTextColor(40, 40, 40);
        doc.text(param.value, margin + 55, yPos);
        yPos += 5;
      });

      yPos += 8;
    });

    // Expected Outcomes
    checkNewPage(25);
    doc.setFontSize(12);
    doc.setTextColor(0, 100, 200);
    doc.text(`Expected Outcomes by Week ${phase.reEvaluationWeek}`, margin, yPos);
    doc.text(`預期成果（第 ${phase.reEvaluationWeek} 週）`, margin + 80, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    phase.expectedOutcomes.forEach((outcome) => {
      checkNewPage(8);
      doc.text(`✓ ${outcome}`, margin + 5, yPos);
      yPos += 6;
    });

    yPos += 10;
    drawLine();
    yPos += 5;
  });

  // === Home Therapy Notes ===
  checkNewPage(50);
  
  doc.setFontSize(16);
  doc.setTextColor(255, 140, 0);
  doc.text('Home Therapy Notes', margin, yPos);
  doc.text('居家訓練注意事項', margin + 70, yPos);
  yPos += 12;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  protocol.homeTherapyNotes.forEach((note, idx) => {
    checkNewPage(15);
    addWrappedText(`${idx + 1}. ${note}`, margin + 5, contentWidth - 10, 10);
    yPos += 3;
  });

  // === Important Reminders Page ===
  doc.addPage();
  yPos = margin;

  doc.setFontSize(18);
  doc.setTextColor(220, 20, 60);
  doc.text('Important Reminders', margin, yPos);
  doc.text('重要提醒', margin + 80, yPos);
  yPos += 15;

  const reminders = [
    {
      en: 'Stop immediately if you experience headache, nausea, or dizziness',
      zh: '如有頭痛、噁心或頭暈請立即停止訓練'
    },
    {
      en: 'Maintain good lighting during exercises',
      zh: '訓練時確保環境光線充足'
    },
    {
      en: 'Record your training progress daily',
      zh: '每日記錄訓練情況'
    },
    {
      en: 'Follow the 20-20-20 rule during screen time',
      zh: '使用螢幕時遵循 20-20-20 法則'
    },
    {
      en: 'Attend all scheduled follow-up appointments',
      zh: '按時回診複查'
    },
    {
      en: 'Contact your optometrist if symptoms worsen',
      zh: '症狀加重請立即聯繫驗光師'
    }
  ];

  doc.setFontSize(11);
  reminders.forEach((reminder, idx) => {
    checkNewPage(15);
    doc.setTextColor(220, 20, 60);
    doc.text(`${idx + 1}.`, margin, yPos);
    doc.setTextColor(60, 60, 60);
    doc.text(reminder.en, margin + 8, yPos);
    yPos += 6;
    doc.setTextColor(100, 100, 100);
    doc.text(reminder.zh, margin + 8, yPos);
    yPos += 10;
  });

  // === Weekly Training Log Template ===
  doc.addPage();
  yPos = margin;

  doc.setFontSize(18);
  doc.setTextColor(41, 98, 255);
  doc.text('Weekly Training Log', margin, yPos);
  doc.text('每週訓練記錄', margin + 75, yPos);
  yPos += 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Use this template to track your daily training. 使用此模板記錄每日訓練。', margin, yPos);
  yPos += 15;

  // Draw log table
  const days = ['Mon/一', 'Tue/二', 'Wed/三', 'Thu/四', 'Fri/五', 'Sat/六', 'Sun/日'];
  const colWidth = (contentWidth - 30) / 7;
  
  // Header row
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, contentWidth, 10, 'F');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('Exercise', margin + 2, yPos + 7);
  
  days.forEach((day, idx) => {
    doc.text(day, margin + 30 + idx * colWidth, yPos + 7, { align: 'center' });
  });
  yPos += 12;

  // Exercise rows (4 rows for exercises)
  for (let row = 0; row < 4; row++) {
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos, contentWidth, 12);
    doc.line(margin + 28, yPos, margin + 28, yPos + 12);
    
    days.forEach((_, idx) => {
      doc.line(margin + 28 + (idx + 1) * colWidth, yPos, margin + 28 + (idx + 1) * colWidth, yPos + 12);
    });
    
    yPos += 12;
  }

  // Notes section
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('Notes / 備註:', margin, yPos);
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  for (let i = 0; i < 5; i++) {
    doc.line(margin, yPos + i * 8, pageWidth - margin, yPos + i * 8);
  }

  // Save the PDF
  const fileName = `Vision_Therapy_Manual_${protocol.pattern}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Print therapy plan
export function printTherapyPlan(protocol: VisionTherapyProtocol): void {
  // Create a printable HTML version
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vision Therapy Manual - ${getPatternDisplayName(protocol.pattern)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #2962ff; border-bottom: 2px solid #2962ff; padding-bottom: 10px; }
        h2 { color: #2962ff; margin-top: 30px; }
        h3 { color: #333; }
        .phase { page-break-inside: avoid; margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .exercise { margin: 15px 0; padding: 10px; background: white; border-left: 3px solid #2962ff; }
        .params { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 14px; }
        .param-label { color: #666; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .easy { background: #d4edda; color: #155724; }
        .medium { background: #fff3cd; color: #856404; }
        .hard { background: #f8d7da; color: #721c24; }
        .goals { background: #e8f5e9; padding: 10px; border-radius: 5px; }
        .notes { background: #fff8e1; padding: 15px; border-radius: 5px; margin-top: 20px; }
        @media print { .page-break { page-break-before: always; } }
      </style>
    </head>
    <body>
      <h1>Vision Therapy Training Manual<br><small>視覺訓練手冊</small></h1>
      <h2>${getPatternDisplayName(protocol.pattern)}</h2>
      <p><strong>Total Duration / 總療程:</strong> ${protocol.totalWeeks} weeks / 週</p>
      
      ${protocol.phases.map((phase, idx) => `
        <div class="phase ${idx > 0 ? 'page-break' : ''}">
          <h2>Phase ${idx + 1}: ${phase.phaseName}</h2>
          <p><em>${phase.weeks}</em></p>
          
          <div class="goals">
            <h3>Goals / 訓練目標</h3>
            <ul>
              ${phase.goals.map(g => `<li>${g}</li>`).join('')}
            </ul>
          </div>
          
          ${phase.exercises.map((ex, exIdx) => `
            <div class="exercise">
              <h3>${exIdx + 1}. ${ex.name} ${ex.nameEn ? `(${ex.nameEn})` : ''}</h3>
              <span class="badge ${ex.difficulty}">${ex.difficulty === 'easy' ? '簡單' : ex.difficulty === 'medium' ? '中等' : '困難'}</span>
              <p>${ex.description}</p>
              <div class="params">
                <div><span class="param-label">頻率:</span> ${ex.frequency}</div>
                <div><span class="param-label">時長:</span> ${ex.duration}</div>
                <div><span class="param-label">目標:</span> ${ex.target}</div>
                <div><span class="param-label">進度:</span> ${ex.progression}</div>
              </div>
            </div>
          `).join('')}
          
          <h3>Expected Outcomes by Week ${phase.reEvaluationWeek} / 預期成果</h3>
          <ul>
            ${phase.expectedOutcomes.map(o => `<li>✓ ${o}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
      
      <div class="notes page-break">
        <h2>Home Therapy Notes / 居家訓練注意事項</h2>
        <ol>
          ${protocol.homeTherapyNotes.map(n => `<li>${n}</li>`).join('')}
        </ol>
      </div>
      
      <p style="text-align: center; color: #999; margin-top: 30px;">
        Generated on ${new Date().toLocaleDateString()}
      </p>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
