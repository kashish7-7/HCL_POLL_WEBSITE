package export

import (
	"archive/zip"
	"bytes"
	"fmt"
	"html"

	"backend/internal/models"
)

func GenerateExcel(question string, options []models.OptionResult, totalVotes int64) ([]byte, error) {
	buf := new(bytes.Buffer)
	zw := zip.NewWriter(buf)

	files := map[string]string{
		"[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,

		"_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,

		"xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,

		"xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Poll Results" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
	}

	for name, content := range files {
		f, err := zw.Create(name)
		if err != nil {
			return nil, err
		}
		if _, err := f.Write([]byte(content)); err != nil {
			return nil, err
		}
	}

	// Build sheet1.xml dynamically
	sheetBuf := new(bytes.Buffer)
	sheetBuf.WriteString(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>`)

	// Row 1: Poll Title
	sheetBuf.WriteString(fmt.Sprintf(`<row r="1"><c r="A1" t="inlineStr"><is><t>Poll Question: %s</t></is></c></row>`, html.EscapeString(question)))
	sheetBuf.WriteString(`<row r="2"/>`)

	// Row 3: Column Headers
	sheetBuf.WriteString(`<row r="3">
      <c r="A3" t="inlineStr"><is><t>Option ID</t></is></c>
      <c r="B3" t="inlineStr"><is><t>Option Text</t></is></c>
      <c r="C3" t="inlineStr"><is><t>Votes</t></is></c>
      <c r="D3" t="inlineStr"><is><t>Percentage (%)</t></is></c>
    </row>`)

	rowIdx := 4
	for _, opt := range options {
		sheetBuf.WriteString(fmt.Sprintf(`<row r="%d">
      <c r="A%d" t="inlineStr"><is><t>%s</t></is></c>
      <c r="B%d" t="inlineStr"><is><t>%s</t></is></c>
      <c r="C%d"><v>%d</v></c>
      <c r="D%d"><v>%.2f</v></c>
    </row>`, rowIdx, rowIdx, html.EscapeString(opt.ID), rowIdx, html.EscapeString(opt.Text), rowIdx, opt.Votes, rowIdx, opt.Percentage))
		rowIdx++
	}

	// Summary Row
	sheetBuf.WriteString(fmt.Sprintf(`<row r="%d"/>`, rowIdx))
	rowIdx++
	sheetBuf.WriteString(fmt.Sprintf(`<row r="%d">
      <c r="A%d" t="inlineStr"><is><t>Total Votes</t></is></c>
      <c r="B%d" t="inlineStr"><is><t>All Options</t></is></c>
      <c r="C%d"><v>%d</v></c>
      <c r="D%d"><v>100</v></c>
    </row>`, rowIdx, rowIdx, rowIdx, rowIdx, totalVotes, rowIdx))

	sheetBuf.WriteString(`</sheetData></worksheet>`)

	f, err := zw.Create("xl/worksheets/sheet1.xml")
	if err != nil {
		return nil, err
	}
	if _, err := f.Write(sheetBuf.Bytes()); err != nil {
		return nil, err
	}

	if err := zw.Close(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
