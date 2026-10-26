/**
 * LuminaLearn — Congressional App Challenge 2026 PowerPoint (.pptx) Generator
 *
 * Presenter: Jose Unanue (12th Grade · Miami Coral Park Senior High School · FL-27)
 *
 * Usage:
 *   npm run export-pptx
 *
 * Outputs:
 *   1. ./LuminaLearn_CAC_2026_Pitch_Deck.pptx
 *   2. ./public/LuminaLearn_CAC_2026_Pitch_Deck.pptx (for 1-click download inside the web app)
 */

import fs from 'node:fs';
import path from 'node:path';
import PptxGenJS from 'pptxgenjs';
import {
  PRESENTER_METADATA,
  CAC_PITCH_DECK_SLIDES
} from '../src/data/pitchDeckData.js';

const COLORS = {
  NAVY_BG: '0B2149',
  NAVY_CARD: '163266',
  NAVY_BORDER: '2B4C8C',
  LIGHT_BG: 'F8FAFC',
  WHITE: 'FFFFFF',
  SLATE_BORDER: 'CBD5E1',
  INDIGO: '4F46E5',
  INDIGO_SOFT: 'EEF2FF',
  INDIGO_TEXT: '312E81',
  AMBER: 'F59E0B',
  AMBER_LIGHT: 'FDE68A',
  EMERALD: '10B981',
  TEXT_DARK: '0F172A',
  TEXT_MUTED: '475569',
  TEXT_LIGHT: 'E2E8F0',
  CODE_BG: '090D16'
};

async function buildPresentation() {
  const pptx = new PptxGenJS();

  // Set 16:9 Widescreen Layout (13.333 x 7.5 inches)
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = `${PRESENTER_METADATA.presenterName} (${PRESENTER_METADATA.schoolName}, ${PRESENTER_METADATA.district})`;
  pptx.company = `${PRESENTER_METADATA.schoolName} — Congressional App Challenge 2026 (${PRESENTER_METADATA.district})`;
  pptx.subject = PRESENTER_METADATA.subtitle;
  pptx.title = `${PRESENTER_METADATA.projectName} — Congressional App Challenge 2026 (${PRESENTER_METADATA.district})`;

  CAC_PITCH_DECK_SLIDES.forEach((s) => {
    const slide = pptx.addSlide();
    const isNavy = s.themeStyle === 'navy';

    // 1. Slide Background (60% Dominant Surface)
    slide.background = {
      color: isNavy ? COLORS.NAVY_BG : COLORS.LIGHT_BG
    };

    // 2. Top Header Strip: Section Badge + Timecode + Presenter Credit
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 0.35,
      w: 5.4,
      h: 0.38,
      rectRadius: 0.08,
      fill: { color: isNavy ? COLORS.AMBER : COLORS.INDIGO_SOFT },
      line: {
        color: isNavy ? COLORS.AMBER : COLORS.INDIGO,
        width: 1
      }
    });

    slide.addText(s.sectionBadge.toUpperCase(), {
      x: 0.7,
      y: 0.37,
      w: 5.2,
      h: 0.34,
      fontSize: 10,
      bold: true,
      fontFace: 'Calibri',
      color: isNavy ? COLORS.TEXT_DARK : COLORS.INDIGO_TEXT,
      valign: 'middle'
    });

    // Right Top Pill: Timecode + Slide Number
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.7,
      y: 0.35,
      w: 3.03,
      h: 0.38,
      rectRadius: 0.08,
      fill: { color: isNavy ? COLORS.NAVY_CARD : COLORS.WHITE },
      line: {
        color: isNavy ? COLORS.NAVY_BORDER : COLORS.SLATE_BORDER,
        width: 1
      }
    });

    slide.addText(
      `Slide ${s.slideNumber}/${CAC_PITCH_DECK_SLIDES.length}  |  Time: ${s.timecode}`,
      {
        x: 9.8,
        y: 0.37,
        w: 2.83,
        h: 0.34,
        fontSize: 10,
        bold: true,
        fontFace: 'Consolas',
        align: 'right',
        color: isNavy ? COLORS.AMBER_LIGHT : COLORS.TEXT_MUTED,
        valign: 'middle'
      }
    );

    // 3. Assertion Headline & Subtitle
    slide.addText(s.assertionTitle, {
      x: 0.6,
      y: 0.88,
      w: 12.13,
      h: 0.82,
      fontSize: 22,
      bold: true,
      fontFace: 'Calibri',
      color: isNavy ? COLORS.WHITE : COLORS.TEXT_DARK,
      valign: 'top'
    });

    slide.addText(s.subtitle, {
      x: 0.6,
      y: 1.72,
      w: 12.13,
      h: 0.48,
      fontSize: 13,
      bold: s.slideNumber === 1,
      fontFace: 'Calibri',
      color: isNavy
        ? s.slideNumber === 1
          ? COLORS.AMBER_LIGHT
          : COLORS.TEXT_LIGHT
        : COLORS.TEXT_MUTED,
      valign: 'top'
    });

    // Optional Mission Banner on Slide 1
    if (s.missionBanner) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 2.25,
        w: 12.13,
        h: 0.58,
        rectRadius: 0.08,
        fill: { color: COLORS.NAVY_CARD },
        line: { color: COLORS.AMBER, width: 1.2 }
      });
      slide.addText(s.missionBanner, {
        x: 0.8,
        y: 2.29,
        w: 11.73,
        h: 0.5,
        fontSize: 12,
        bold: true,
        fontFace: 'Calibri',
        color: COLORS.WHITE,
        valign: 'middle'
      });
    }

    // 4A. Visual Evidence Type A: 3 Key Metric Cards (Slides 1, 2, 7)
    if (s.keyMetrics) {
      const cardY = s.missionBanner ? 3.05 : 2.45;
      const cardH = s.missionBanner ? 3.55 : 4.15;
      const cardW = 3.84;
      const gap = 0.3;

      s.keyMetrics.forEach((m, idx) => {
        const cardX = 0.6 + idx * (cardW + gap);

        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardH,
          rectRadius: 0.12,
          fill: { color: isNavy ? COLORS.NAVY_CARD : COLORS.WHITE },
          line: {
            color: isNavy ? COLORS.NAVY_BORDER : COLORS.SLATE_BORDER,
            width: 1.2
          }
        });

        // Top Accent Bar inside Metric Card
        slide.addShape(pptx.ShapeType.rect, {
          x: cardX + 0.25,
          y: cardY + 0.28,
          w: 0.9,
          h: 0.08,
          fill: { color: isNavy ? COLORS.AMBER : COLORS.INDIGO }
        });

        // Big Metric Value
        slide.addText(m.value, {
          x: cardX + 0.25,
          y: cardY + 0.5,
          w: cardW - 0.5,
          h: 0.7,
          fontSize: 24,
          bold: true,
          fontFace: 'Calibri',
          color: isNavy ? COLORS.AMBER_LIGHT : COLORS.INDIGO
        });

        // Metric Title
        slide.addText(m.label, {
          x: cardX + 0.25,
          y: cardY + 1.25,
          w: cardW - 0.5,
          h: 0.45,
          fontSize: 14,
          bold: true,
          fontFace: 'Calibri',
          color: isNavy ? COLORS.WHITE : COLORS.TEXT_DARK
        });

        // Metric Explanation
        slide.addText(m.detail, {
          x: cardX + 0.25,
          y: cardY + 1.78,
          w: cardW - 0.5,
          h: 1.5,
          fontSize: 12,
          fontFace: 'Calibri',
          color: isNavy ? COLORS.TEXT_LIGHT : COLORS.TEXT_MUTED,
          valign: 'top'
        });
      });
    }

    // 4B. Visual Evidence Type B: Two-Column Module Breakdown Cards (Slides 3, 4, 5)
    if (s.moduleCards) {
      const cardW = 5.9;
      const cardH = 4.35;
      const cardY = 2.3;
      const gap = 0.33;

      s.moduleCards.forEach((mod, idx) => {
        const cardX = 0.6 + idx * (cardW + gap);

        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardH,
          rectRadius: 0.12,
          fill: { color: COLORS.WHITE },
          line: { color: COLORS.SLATE_BORDER, width: 1.2 }
        });

        // Module Badge Pill
        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX + 0.25,
          y: cardY + 0.22,
          w: cardW - 0.5,
          h: 0.32,
          rectRadius: 0.06,
          fill: { color: COLORS.INDIGO_SOFT },
          line: { color: COLORS.INDIGO, width: 0.75 }
        });

        slide.addText(mod.badge.toUpperCase(), {
          x: cardX + 0.35,
          y: cardY + 0.23,
          w: cardW - 0.7,
          h: 0.3,
          fontSize: 9.5,
          bold: true,
          fontFace: 'Calibri',
          color: COLORS.INDIGO_TEXT,
          valign: 'middle'
        });

        // Module Title
        slide.addText(mod.title, {
          x: cardX + 0.25,
          y: cardY + 0.62,
          w: cardW - 0.5,
          h: 0.42,
          fontSize: 15,
          bold: true,
          fontFace: 'Calibri',
          color: COLORS.TEXT_DARK
        });

        // Purpose Callout Box
        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX + 0.25,
          y: cardY + 1.1,
          w: cardW - 0.5,
          h: 0.72,
          rectRadius: 0.06,
          fill: { color: COLORS.LIGHT_BG },
          line: { color: COLORS.SLATE_BORDER, width: 0.75 }
        });

        slide.addText(`Purpose: ${mod.purpose}`, {
          x: cardX + 0.35,
          y: cardY + 1.14,
          w: cardW - 0.7,
          h: 0.64,
          fontSize: 10.5,
          bold: true,
          fontFace: 'Calibri',
          color: COLORS.INDIGO_TEXT,
          valign: 'middle'
        });

        // Highlights Bullet List
        const bulletText = mod.highlights
          .map((h) => `✓  ${h}`)
          .join('\n\n');
        slide.addText(bulletText, {
          x: cardX + 0.25,
          y: cardY + 1.95,
          w: cardW - 0.5,
          h: 2.25,
          fontSize: 11,
          fontFace: 'Calibri',
          color: COLORS.TEXT_DARK,
          valign: 'top'
        });
      });
    }

    // 4C. Visual Evidence Type C: Technical Architecture & Code Dive (Slide 6)
    if (s.codeDiveBlocks) {
      const leftX = 0.6;
      const leftW = 6.7;
      let currentY = 2.3;

      s.codeDiveBlocks.forEach((blk) => {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: leftX,
          y: currentY,
          w: leftW,
          h: 1.38,
          rectRadius: 0.08,
          fill: { color: COLORS.NAVY_CARD },
          line: { color: COLORS.NAVY_BORDER, width: 1 }
        });

        slide.addText(`${blk.title}  [${blk.badge}]`, {
          x: leftX + 0.2,
          y: currentY + 0.1,
          w: leftW - 0.4,
          h: 0.3,
          fontSize: 11.5,
          bold: true,
          fontFace: 'Calibri',
          color: COLORS.AMBER_LIGHT
        });

        const pts = blk.points.map((p) => `• ${p}`).join('\n');
        slide.addText(pts, {
          x: leftX + 0.2,
          y: currentY + 0.42,
          w: leftW - 0.4,
          h: 0.9,
          fontSize: 9.8,
          fontFace: 'Calibri',
          color: COLORS.TEXT_LIGHT,
          valign: 'top'
        });

        currentY += 1.48;
      });

      // Right Column: Code Dive Box
      const rightX = 7.55;
      const rightW = 5.18;
      const rightY = 2.3;
      const rightH = 4.35;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: rightX,
        y: rightY,
        w: rightW,
        h: rightH,
        rectRadius: 0.1,
        fill: { color: COLORS.CODE_BG },
        line: { color: COLORS.INDIGO, width: 1.5 }
      });

      slide.addText(
        'CODE DIVE: server/apiMiddleware.js (FERPA & Socratic Guard)',
        {
          x: rightX + 0.2,
          y: rightY + 0.15,
          w: rightW - 0.4,
          h: 0.32,
          fontSize: 10,
          bold: true,
          fontFace: 'Consolas',
          color: COLORS.AMBER_LIGHT
        }
      );

      slide.addText(s.codeSnippet, {
        x: rightX + 0.2,
        y: rightY + 0.55,
        w: rightW - 0.4,
        h: rightH - 0.7,
        fontSize: 9.2,
        fontFace: 'Consolas',
        color: '6EE7B7',
        valign: 'top'
      });
    }

    // 5. Slide Footer Strip
    slide.addText(
      `${PRESENTER_METADATA.projectName}  ·  ${PRESENTER_METADATA.presenterName} (${PRESENTER_METADATA.gradeLevel}, ${PRESENTER_METADATA.schoolName})  ·  Congressional District ${PRESENTER_METADATA.district}`,
      {
        x: 0.6,
        y: 6.92,
        w: 12.13,
        h: 0.35,
        fontSize: 9.5,
        bold: true,
        fontFace: 'Calibri',
        color: isNavy ? COLORS.TEXT_LIGHT : COLORS.TEXT_MUTED
      }
    );

    // 6. Add Presenter Voiceover Script to PowerPoint Speaker Notes
    slide.addNotes(
      `[${s.sectionBadge} — Timecode ${s.timecode}]\n\nVoiceover Script:\n${s.presenterScript}\n\nLive App Demo Action: ${s.liveActionLabel}`
    );
  });

  const rootDir = process.cwd();
  const rootOutPath = path.join(
    rootDir,
    'LuminaLearn_CAC_2026_Pitch_Deck.pptx'
  );
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicOutPath = path.join(
    publicDir,
    'LuminaLearn_CAC_2026_Pitch_Deck.pptx'
  );

  await pptx.writeFile({ fileName: publicOutPath });
  console.log(`✔ Generated PowerPoint Deck: ${publicOutPath}`);

  try {
    fs.copyFileSync(publicOutPath, rootOutPath);
    console.log(`✔ Updated root PowerPoint Deck: ${rootOutPath}`);
  } catch (copyErr) {
    if (copyErr.code === 'EBUSY') {
      console.log(
        `ℹ Note: ${rootOutPath} is currently open in PowerPoint; updated ${publicOutPath} successfully.`
      );
    } else {
      throw copyErr;
    }
  }
}

buildPresentation().catch((err) => {
  console.error('Failed to generate PowerPoint deck:', err);
  process.exit(1);
});
