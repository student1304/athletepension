"""
Financial analysis endpoints.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Any, Dict
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from app.services.financial_calculator import FinancialCalculator

router = APIRouter()


class FinancialAnalysisRequest(BaseModel):
    """Request model for financial analysis."""
    age: int = Field(..., ge=18, le=100, description="Current age")
    retirement_age: int = Field(..., ge=18, le=100, description="Target retirement age")
    current_wealth: float = Field(..., ge=0, description="Current total wealth")
    current_income: float = Field(..., gt=0, description="Current annual income")
    monthly_payout_required: float = Field(..., gt=0, description="Required monthly payout in retirement")
    
    # Optional: custom assumptions
    withdrawal_rate: Optional[float] = Field(0.04, description="Safe withdrawal rate (default 4%)")
    growth_rate_pre_retirement: Optional[float] = Field(0.05, description="Expected CAGR until retirement (default 5%)")
    growth_rate_post_retirement: Optional[float] = Field(0.03, description="Expected post-retirement growth (default 3%)")
    inflation_rate: Optional[float] = Field(0.03, description="Expected inflation rate (default 3%)")
    tax_rate: Optional[float] = Field(0.35, description="Tax rate on investment gains (default 35%)")


@router.post("/analyze")
async def analyze_financial_plan(request: FinancialAnalysisRequest):
    """
    Analyze retirement financial plan and provide recommendations.
    
    This endpoint:
    - Calculates required retirement corpus
    - Projects wealth growth
    - Determines savings requirements
    - Generates personalized recommendations
    
    Returns comprehensive analysis including projections and actionable advice.
    """
    try:
        # Validate retirement age
        if request.retirement_age <= request.age:
            raise HTTPException(
                status_code=400,
                detail="Retirement age must be greater than current age"
            )
        
        # Create calculator with assumptions
        calculator = FinancialCalculator(
            withdrawal_rate=request.withdrawal_rate,
            growth_rate_pre_retirement=request.growth_rate_pre_retirement,
            growth_rate_post_retirement=request.growth_rate_post_retirement,
            inflation_rate=request.inflation_rate,
            tax_rate=request.tax_rate
        )
        
        # Perform analysis
        analysis = calculator.calculate_retirement_analysis(
            current_age=request.age,
            retirement_age=request.retirement_age,
            current_wealth=request.current_wealth,
            current_income=request.current_income,
            monthly_payout_required=request.monthly_payout_required
        )
        
        return {
            "success": True,
            "analysis": analysis,
            "message": "Financial analysis completed successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error performing financial analysis: {str(e)}"
        )


@router.get("/assumptions")
async def get_default_assumptions():
    """
    Get default financial assumptions used in calculations.
    
    Returns the standard assumptions for:
    - Withdrawal rate (4% rule)
    - Growth rates (pre and post retirement)
    - Inflation rate
    """
    return {
        "default_profile": {
            "name": "Standard",
            "withdrawal_rate": 0.04,
            "growth_rate_pre_retirement": 0.05,
            "growth_rate_post_retirement": 0.03,
            "inflation_rate": 0.03,
            "tax_rate": 0.35,
            "description": "Conservative assumptions based on historical market data with 35% tax rate"
        },
        "profiles": [
            {
                "name": "Conservative",
                "withdrawal_rate": 0.035,
                "growth_rate_pre_retirement": 0.04,
                "growth_rate_post_retirement": 0.025,
                "inflation_rate": 0.03,
                "tax_rate": 0.35,
                "description": "Lower risk, lower return expectations with 35% tax rate"
            },
            {
                "name": "Moderate",
                "withdrawal_rate": 0.04,
                "growth_rate_pre_retirement": 0.05,
                "growth_rate_post_retirement": 0.03,
                "inflation_rate": 0.03,
                "tax_rate": 0.35,
                "description": "Balanced approach with standard assumptions and 35% tax rate"
            },
            {
                "name": "Aggressive",
                "withdrawal_rate": 0.045,
                "growth_rate_pre_retirement": 0.07,
                "growth_rate_post_retirement": 0.04,
                "inflation_rate": 0.03,
                "tax_rate": 0.35,
                "description": "Higher risk, higher return expectations with 35% tax rate"
            }
        ],
        "explanation": {
            "withdrawal_rate": "The percentage of your retirement corpus you can safely withdraw each year (4% rule)",
            "growth_rate_pre_retirement": "Expected compound annual growth rate (CAGR) before retirement (before taxes)",
            "growth_rate_post_retirement": "Expected growth rate after retirement (before taxes, usually more conservative)",
            "inflation_rate": "Expected annual inflation affecting purchasing power",
            "tax_rate": "Tax rate applied to investment gains (35% reduces effective CAGR)"
        }
    }


class EmailReportRequest(BaseModel):
    """Request model for emailing financial report."""
    email: EmailStr = Field(..., description="Email address to send report to")
    analysis: Dict[str, Any] = Field(..., description="Analysis data to include in email")


class PDFReportRequest(BaseModel):
    """Request model for PDF generation."""
    analysis: Dict[str, Any] = Field(..., description="Analysis data to include in PDF")


@router.post("/email-report")
async def email_financial_report(request: EmailReportRequest):
    """
    Email financial analysis report to user.
    
    Sends a formatted HTML email with analysis results and recommendations.
    """
    try:
        # Format the email content
        analysis = request.analysis
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
                .content {{ padding: 20px; }}
                .section {{ margin: 20px 0; padding: 15px; background: #f7fafc; border-left: 4px solid #667eea; }}
                .metric {{ display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .metric-label {{ font-size: 12px; color: #718096; }}
                .metric-value {{ font-size: 24px; font-weight: bold; color: #2d3748; }}
                .recommendation {{ margin: 10px 0; padding: 10px; background: #ebf8ff; border-left: 3px solid #4299e1; }}
                .footer {{ margin-top: 30px; padding: 20px; background: #edf2f7; text-align: center; font-size: 12px; color: #718096; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Your Financial Analysis Report</h1>
                <p>Comprehensive retirement planning analysis</p>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2>Status: {'✅ On Track' if analysis['status']['is_on_track'] else '⚠️ Action Required'}</h2>
                    <p><strong>Feasibility Score:</strong> {analysis['status']['feasibility_score']}/100</p>
                    <p><strong>Urgency Level:</strong> {analysis['status']['urgency_level'].title()}</p>
                </div>
                
                <div class="section">
                    <h2>Key Metrics</h2>
                    <div class="metric">
                        <div class="metric-label">Required Corpus</div>
                        <div class="metric-value">${analysis['projections']['required_corpus']:,.0f}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Projected Wealth</div>
                        <div class="metric-value">${analysis['projections']['projected_wealth_at_retirement']:,.0f}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">{'Wealth Gap' if analysis['projections']['wealth_gap'] > 0 else 'Surplus'}</div>
                        <div class="metric-value">${abs(analysis['projections']['wealth_gap']):,.0f}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Monthly Savings Needed</div>
                        <div class="metric-value">${analysis['projections']['required_monthly_savings']:,.0f}</div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Your Timeline</h2>
                    <p><strong>Current Age:</strong> {analysis['inputs']['current_age']} years</p>
                    <p><strong>Retirement Age:</strong> {analysis['inputs']['retirement_age']} years</p>
                    <p><strong>Years to Save:</strong> {analysis['projections']['years_to_retirement']} years</p>
                    <p><strong>Savings Rate Required:</strong> {analysis['projections']['savings_rate_percentage']:.1f}% of income</p>
                </div>
                
                <div class="section">
                    <h2>Personalized Recommendations</h2>
                    {''.join(f'<div class="recommendation">{rec}</div>' for rec in analysis['recommendations'])}
                </div>
                
                <div class="section">
                    <h2>Calculation Assumptions</h2>
                    <p><strong>Withdrawal Rate:</strong> {analysis['assumptions']['withdrawal_rate'] * 100:.1f}% (4% rule)</p>
                    <p><strong>Pre-Retirement Growth:</strong> {analysis['assumptions']['growth_rate_pre_retirement'] * 100:.1f}% CAGR</p>
                    <p><strong>Post-Retirement Growth:</strong> {analysis['assumptions']['growth_rate_post_retirement'] * 100:.1f}%</p>
                    <p><strong>Inflation Rate:</strong> {analysis['assumptions']['inflation_rate'] * 100:.1f}%</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Disclaimer:</strong> This analysis is for educational purposes only and should not be considered financial advice. Please consult with a certified financial planner before making significant financial decisions.</p>
                <p>© 2024 Athlete Pension Platform</p>
            </div>
        </body>
        </html>
        """
        
        # Send email (using environment variables for credentials)
        sender_email = os.getenv('SMTP_EMAIL', 'noreply@athletepension.com')
        smtp_password = os.getenv('SMTP_PASSWORD', '')
        smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        
        message = MIMEMultipart('alternative')
        message['Subject'] = 'Your Financial Analysis Report - Athlete Pension'
        message['From'] = sender_email
        message['To'] = request.email
        
        html_part = MIMEText(html_content, 'html')
        message.attach(html_part)
        
        # For development, just return success without actually sending
        # In production, uncomment the SMTP code below
        """
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(sender_email, smtp_password)
            server.send_message(message)
        """
        
        return {
            "success": True,
            "message": f"Report sent to {request.email}",
            "note": "In development mode - email sending is simulated"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending email: {str(e)}"
        )


@router.post("/generate-pdf")
async def generate_pdf_report(request: PDFReportRequest):
    """
    Generate PDF report of financial analysis.
    
    Returns a downloadable PDF document with comprehensive analysis.
    """
    try:
        analysis = request.analysis
        
        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        story = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2d3748'),
            spaceAfter=12,
            spaceBefore=20
        )
        
        # Title
        story.append(Paragraph("📊 Financial Analysis Report", title_style))
        story.append(Paragraph("Comprehensive Retirement Planning Analysis", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Status
        status_text = "✅ On Track!" if analysis['status']['is_on_track'] else "⚠️ Action Required"
        story.append(Paragraph(f"<b>Status:</b> {status_text}", styles['Normal']))
        story.append(Paragraph(f"<b>Feasibility Score:</b> {analysis['status']['feasibility_score']}/100", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        # Key Metrics Table
        story.append(Paragraph("Key Financial Metrics", heading_style))
        metrics_data = [
            ['Metric', 'Value'],
            ['Required Corpus', f"${analysis['projections']['required_corpus']:,.0f}"],
            ['Projected Wealth at Retirement', f"${analysis['projections']['projected_wealth_at_retirement']:,.0f}"],
            ['Wealth Gap' if analysis['projections']['wealth_gap'] > 0 else 'Surplus',
             f"${abs(analysis['projections']['wealth_gap']):,.0f}"],
            ['Monthly Savings Needed', f"${analysis['projections']['required_monthly_savings']:,.0f}"],
            ['Savings Rate Required', f"{analysis['projections']['savings_rate_percentage']:.1f}% of income"],
        ]
        
        metrics_table = Table(metrics_data, colWidths=[3*inch, 3*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Timeline
        story.append(Paragraph("Your Timeline", heading_style))
        story.append(Paragraph(f"<b>Current Age:</b> {analysis['inputs']['current_age']} years", styles['Normal']))
        story.append(Paragraph(f"<b>Retirement Age:</b> {analysis['inputs']['retirement_age']} years", styles['Normal']))
        story.append(Paragraph(f"<b>Years to Save:</b> {analysis['projections']['years_to_retirement']} years", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        # Recommendations
        story.append(Paragraph("Personalized Recommendations", heading_style))
        for i, rec in enumerate(analysis['recommendations'], 1):
            story.append(Paragraph(f"{i}. {rec}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        # Assumptions
        story.append(Paragraph("Calculation Assumptions", heading_style))
        story.append(Paragraph(f"<b>Withdrawal Rate:</b> {analysis['assumptions']['withdrawal_rate'] * 100:.1f}% (4% rule)", styles['Normal']))
        story.append(Paragraph(f"<b>Pre-Retirement Growth:</b> {analysis['assumptions']['growth_rate_pre_retirement'] * 100:.1f}% CAGR", styles['Normal']))
        story.append(Paragraph(f"<b>Post-Retirement Growth:</b> {analysis['assumptions']['growth_rate_post_retirement'] * 100:.1f}%", styles['Normal']))
        story.append(Paragraph(f"<b>Inflation Rate:</b> {analysis['assumptions']['inflation_rate'] * 100:.1f}%", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Disclaimer
        story.append(Paragraph("<i>Disclaimer: This analysis is for educational purposes only and should not be considered financial advice. Please consult with a certified financial planner before making significant financial decisions.</i>", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=financial-analysis-report.pdf"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF: {str(e)}"
        )