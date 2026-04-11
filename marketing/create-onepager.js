const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, ShadingType, HeadingLevel } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 } // 11pt
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1E5A96" },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "1E5A96" },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 1 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: "bullet",
            text: "•",
            alignment: "left",
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              }
            }
          }
        ]
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          size: {
            width: 12240,   // US Letter width
            height: 15840   // US Letter height
          },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
        }
      },
      children: [
        // Logo/Header placeholder
        new Paragraph({
          children: [
            new TextRun({
              text: "BIDSHIELD",
              bold: true,
              size: 28,
              color: "1E5A96"
            })
          ],
          spacing: { after: 120 }
        }),

        // Main Headline
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun("Stop Leaving Money on the Table")
          ],
          spacing: { after: 240 }
        }),

        // Subheading
        new Paragraph({
          children: [
            new TextRun({
              text: "The AI-Powered Pre-Flight Checklist for Commercial Roofing Bids",
              size: 24,
              italics: true,
              color: "666666"
            })
          ],
          spacing: { after: 360 }
        }),

        // Value Prop intro
        new Paragraph({
          children: [
            new TextRun({
              text: "Built by Carlos, a 12-year commercial roofing estimator. Not a tech startup. Real solutions for real estimators.",
              bold: true,
              size: 22,
              color: "333333"
            })
          ],
          spacing: { after: 360 }
        }),

        // Key Benefits Heading
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun("Key Benefits")
          ],
          spacing: { after: 180 }
        }),

        // Benefit 1
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun({
              text: "Catch Scope Gaps Before Submission: ",
              bold: true
            }),
            new TextRun("Missed line items average $15K–$50K per bid. BidShield's AI checks for scope completeness, expired quotes, and pricing conflicts automatically.")
          ],
          spacing: { after: 120 }
        }),

        // Benefit 2
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun({
              text: "AI Bid Score (A–F): ",
              bold: true
            }),
            new TextRun("Know your bid's readiness before you send it. 15 automated checks grade your estimate. You make the final decisions.")
          ],
          spacing: { after: 120 }
        }),

        // Benefit 3
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun({
              text: "5-Minute Checklist: ",
              bold: true
            }),
            new TextRun("Upload your bid. Run the checks. Fix the gaps. Submit with confidence. No complexity. No learning curve.")
          ],
          spacing: { after: 120 }
        }),

        // Benefit 4
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun({
              text: "Estimator Controlled: ",
              bold: true
            }),
            new TextRun("You see every check, every flag, every recommendation. The AI checks your work. You control the decisions.")
          ],
          spacing: { after: 360 }
        }),

        // ROI Section
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun("The Math: ROI You Can Count On")
          ],
          spacing: { after: 180 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "If BidShield catches ONE scope gap per quarter worth $25,000, your annual ROI is 10x.",
              bold: true,
              size: 24
            })
          ],
          spacing: { after: 120 }
        }),

        new Paragraph({
          children: [
            new TextRun("Doing 12 bids per month? That's ~$12 per bid. Most customers pay for it on the first catch.")
          ],
          spacing: { after: 360 }
        }),

        // Features Heading
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun("What BidShield Checks")
          ],
          spacing: { after: 180 }
        }),

        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun("Labor rates & verification")
          ],
          spacing: { after: 80 }
        }),

        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun("Supplier quote expiration dates")
          ],
          spacing: { after: 80 }
        }),

        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun("Completeness of addenda & change orders")
          ],
          spacing: { after: 80 }
        }),

        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun("Insurance certificates & liability coverage")
          ],
          spacing: { after: 80 }
        }),

        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun("Pricing conflicts & margin analysis")
          ],
          spacing: { after: 80 }
        }),

        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: [
            new TextRun("Scope item coverage across all sheets")
          ],
          spacing: { after: 360 }
        }),

        // Pricing Section
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun("Pricing")
          ],
          spacing: { after: 180 }
        }),

        // Pricing Table
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders,
                  width: { size: 4680, type: WidthType.DXA },
                  shading: { fill: "1E5A96", type: ShadingType.CLEAR },
                  margins: { top: 100, bottom: 100, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Monthly",
                          bold: true,
                          size: 24,
                          color: "FFFFFF"
                        })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  borders,
                  width: { size: 4680, type: WidthType.DXA },
                  shading: { fill: "1E5A96", type: ShadingType.CLEAR },
                  margins: { top: 100, bottom: 100, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Annual",
                          bold: true,
                          size: 24,
                          color: "FFFFFF"
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders,
                  width: { size: 4680, type: WidthType.DXA },
                  margins: { top: 100, bottom: 100, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "$149/month",
                          bold: true,
                          size: 26,
                          color: "1E5A96"
                        })
                      ]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Cancel anytime",
                          size: 20
                        })
                      ],
                      spacing: { before: 80 }
                    })
                  ]
                }),
                new TableCell({
                  borders,
                  width: { size: 4680, type: WidthType.DXA },
                  margins: { top: 100, bottom: 100, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "$1,490/year",
                          bold: true,
                          size: 26,
                          color: "1E5A96"
                        })
                      ]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Save $298 (2 months free)",
                          size: 20,
                          color: "10B981"
                        })
                      ],
                      spacing: { before: 80 }
                    })
                  ]
                })
              ]
            })
          ]
        }),

        new Paragraph({
          children: [new TextRun("")],
          spacing: { after: 360 }
        }),

        // Call to Action
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun("Get Started")
          ],
          spacing: { after: 180 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "14-day free trial. No credit card required. Full access to all features.",
              bold: true
            })
          ],
          spacing: { after: 180 }
        }),

        new Paragraph({
          children: [
            new TextRun("Website: "),
            new TextRun({
              text: "www.bidshield.com",
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun("Email: "),
            new TextRun({
              text: "hello@bidshield.com",
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun("Phone: "),
            new TextRun({
              text: "(555) 123-4567",
              bold: true
            })
          ],
          spacing: { after: 360 }
        }),

        // Footer
        new Paragraph({
          children: [
            new TextRun({
              text: "Built by Carlos at MC2 Agency LLC — 12+ years commercial roofing estimating.",
              size: 20,
              italics: true,
              color: "999999"
            })
          ],
          border: {
            top: {
              color: "CCCCCC",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6
            }
          },
          spacing: { before: 360, after: 120 }
        })
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/wizardly-sweet-maxwell/mnt/bidshield/marketing/BidShield-One-Pager.docx", buffer);
  console.log("Document created successfully!");
});
