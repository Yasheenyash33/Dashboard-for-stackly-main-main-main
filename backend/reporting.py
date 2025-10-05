import io
import csv
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from openpyxl import Workbook
from datetime import datetime

def generate_csv_report(users, sessions):
    output = io.StringIO()
    writer = csv.writer(output)

    # Users section
    writer.writerow(['Users Report'])
    writer.writerow(['Generated on', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
    writer.writerow([])
    writer.writerow(['User ID', 'Username', 'Email', 'Role', 'First Name', 'Last Name', 'Created At'])
    for user in users:
        writer.writerow([
            user.id,
            user.username,
            user.email,
            user.role.value,
            user.first_name,
            user.last_name,
            user.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    writer.writerow([])

    # Sessions section
    writer.writerow(['Sessions Report'])
    writer.writerow(['Session ID', 'Title', 'Trainer ID', 'Trainee ID', 'Scheduled Date', 'Duration (min)', 'Status'])
    for session in sessions:
        writer.writerow([
            session.id,
            session.title,
            session.trainer_id,
            session.trainee_id,
            session.scheduled_date.strftime('%Y-%m-%d %H:%M:%S'),
            session.duration_minutes,
            session.status.value
        ])

    output.seek(0)
    return output

def generate_excel_report(users, sessions):
    wb = Workbook()
    ws_users = wb.active
    ws_users.title = "Users"

    # Users sheet
    ws_users.append(['User ID', 'Username', 'Email', 'Role', 'First Name', 'Last Name', 'Created At'])
    for user in users:
        ws_users.append([
            user.id,
            user.username,
            user.email,
            user.role.value,
            user.first_name,
            user.last_name,
            user.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    # Sessions sheet
    ws_sessions = wb.create_sheet("Sessions")
    ws_sessions.append(['Session ID', 'Title', 'Trainer ID', 'Trainee ID', 'Scheduled Date', 'Duration (min)', 'Status'])
    for session in sessions:
        ws_sessions.append([
            session.id,
            session.title,
            session.trainer_id,
            session.trainee_id,
            session.scheduled_date.strftime('%Y-%m-%d %H:%M:%S'),
            session.duration_minutes,
            session.status.value
        ])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output

def generate_pdf_report(users, sessions):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    title = Paragraph("Training Management Report", styles['Title'])
    elements.append(title)
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Paragraph(" ", styles['Normal']))

    # Users section
    elements.append(Paragraph("Users", styles['Heading2']))
    user_data = [['ID', 'Username', 'Email', 'Role', 'First Name', 'Last Name', 'Created At']]
    for user in users:
        user_data.append([
            str(user.id),
            user.username,
            user.email,
            user.role.value,
            user.first_name,
            user.last_name,
            user.created_at.strftime('%Y-%m-%d')
        ])

    user_table = Table(user_data)
    user_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(user_table)
    elements.append(Paragraph(" ", styles['Normal']))

    # Sessions section
    elements.append(Paragraph("Sessions", styles['Heading2']))
    session_data = [['ID', 'Title', 'Trainer ID', 'Trainee ID', 'Scheduled Date', 'Duration', 'Status']]
    for session in sessions:
        session_data.append([
            str(session.id),
            session.title,
            str(session.trainer_id),
            str(session.trainee_id),
            session.scheduled_date.strftime('%Y-%m-%d'),
            f"{session.duration_minutes} min",
            session.status.value
        ])

    session_table = Table(session_data)
    session_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(session_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer
