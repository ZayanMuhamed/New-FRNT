import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function generateAssets() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox'],
  })

  // 1. Poster image
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720 })
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;width:1280px;height:720px;background:#060a14;color:#f4f6fb;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;">
        <div style="text-align:center;padding:40px;border-radius:24px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:14px;color:#8fb4ff;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Hermes Learning Engine</div>
          <h1 style="font-size:36px;margin:0 0 12px;font-weight:700;">Interactive Lesson Stream</h1>
          <p style="font-size:16px;color:#8d95a8;margin:0;">High-fidelity architectural walkthrough & engineering lab</p>
        </div>
      </body>
    </html>
  `)

  fs.mkdirSync('./public/videos', { recursive: true })
  await page.screenshot({ path: './public/videos/poster.jpg', type: 'jpeg', quality: 85 })
  await browser.close()

  // 2. Resource files
  fs.mkdirSync('./public/resources', { recursive: true })

  // Minimal valid PDF (Single page)
  const pdfData = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 18 Tf
50 720 Td
(Hermes Academy - Course Lecture Notes) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
427
%%EOF`
  fs.writeFileSync('./public/resources/lecture-notes.pdf', pdfData)

  // Minimal valid ZIP file (empty zip archive with end of central dir record)
  const zipHeader = Buffer.from([
    0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ])
  fs.writeFileSync('./public/resources/starter-code.zip', zipHeader)

  // Markdown cheatsheet
  const mdData = `# Lesson Cheat Sheet & Reference Guide

## Architecture Summary
- **Network Partitions**: Analysis of split-brain prevention and quorum-based coordination.
- **Lamport Timestamps & Vector Clocks**: Partial order vs. total causal ordering in distributed ledgers.
- **Raft State Machine**: Leader election timeouts, log replication RPCs, and joint consensus transitions.

## Practical Commands
\`\`\`bash
# Run local verification harness
npm test
\`\`\`
`
  fs.writeFileSync('./public/resources/cheatsheet.md', mdData)

  console.log('Static assets and resources generated successfully!')
}

generateAssets()
