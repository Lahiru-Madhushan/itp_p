export const SUPPLIER_ORDER_TEMPLATE = `
  <div style="font-family: Arial, sans-serif; padding:20px; border:1px solid #eee; border-radius:8px;">
    <h2 style="color:#2d6a4f;">New Order Request from Yong SMART</h2>
    <p>Dear {supplierName},</p>
    <p>We would like to place an order for the following item:</p>
    <table style="width:100%; border-collapse: collapse; margin-top:10px;">
      <tr>
        <td style="border:1px solid #ccc; padding:8px; font-weight:bold;">Item</td>
        <td style="border:1px solid #ccc; padding:8px;">{item}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc; padding:8px; font-weight:bold;">Quantity</td>
        <td style="border:1px solid #ccc; padding:8px;">{quantity}</td>
      </tr>
    </table>
    <p>Please confirm availability and expected delivery timeline.</p>
    <br/>
    <p>Thank you,</p>
    <p><strong>Yong SMART Procurement Team</strong></p>
  </div>
`;
