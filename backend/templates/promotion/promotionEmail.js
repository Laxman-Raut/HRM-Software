import emailLayout from "../layouts/emailLayout.js";

const promotionEmail = (promotion) => {
  const employee = promotion.employee;

  const content = `
    <h2 style="color:#16a34a;margin-bottom:20px;">
      🎉 Congratulations on Your Promotion!
    </h2>

    <p style="font-size:16px;color:#374151;">
      Dear <strong>${employee.firstName} ${employee.lastName}</strong>,
    </p>

    <p style="font-size:16px;color:#374151;">
      We are delighted to inform you that you have been promoted.
      Your dedication and outstanding performance have been recognized by the management.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-top:25px;">
      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          Previous Designation
        </td>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          ${promotion.previousDesignation}
        </td>
      </tr>

      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          New Designation
        </td>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          <strong>${promotion.newDesignation}</strong>
        </td>
      </tr>

      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          Department
        </td>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          ${promotion.newDepartment}
        </td>
      </tr>

      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          New Salary
        </td>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          ₹${promotion.newSalary}
        </td>
      </tr>

      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          Effective Date
        </td>
        <td style="padding:12px;border:1px solid #e5e7eb;">
          ${new Date(promotion.effectiveDate).toLocaleDateString()}
        </td>
      </tr>
    </table>

    <p style="margin-top:25px;font-size:16px;color:#374151;">
      Congratulations once again!
      We wish you continued success in your new role.
    </p>
  `;

  return emailLayout({
    title: "Promotion Announcement",
    content,
  });
};

export default promotionEmail;