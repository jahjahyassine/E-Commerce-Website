from pydantic import EmailStr
import resend
from resend.exceptions import ResendError

from models.order import Order
from schemas.order import OrderResponse
from core.config import settings


resend.api_key = settings.RESEND_API_KEY

def send_confirmation_email (
    customer_email: EmailStr,
    order: Order
):
    html = build_order_confirmation_email(order)
    params: resend.Email.SendParams = {
        "from": "ByteStore <onboarding@resend.dev>",
        "to": ["pjust489@gmail.com"],
        "subject": f"Order #{order.id} confirmed",
        "html": html,
    }

    try:
        email = resend.Emails.send(params)
    except ResendError as error:
        raise error



def build_order_confirmation_email(order):
    items_html = ""

    for item in order.items:
        attributes_html = ""

        for key, value in (item.variant_attributes_snapshot or {}).items():
            attributes_html += f"""
                <span style="
                    display:inline-block;
                    margin-right:8px;
                    margin-top:4px;
                    padding:4px 8px;
                    background:#f5f5f5;
                    border-radius:6px;
                    font-size:12px;
                    color:#666666;
                ">
                    {key}: {value}
                </span>
            """

        items_html += f"""
        <tr>
            <td style="padding:16px 0;border-bottom:1px solid #eeeeee;">
                <div style="font-size:15px;font-weight:700;color:#1d1d1f;">
                    {item.product_name}
                </div>

                <div style="margin-top:3px;font-size:13px;color:#777777;">
                    SKU: {item.product_variant.sku}
                </div>

                <div style="margin-top:4px;">
                    {attributes_html}
                </div>

                <div style="margin-top:6px;font-size:13px;color:#777777;">
                    Quantity: {item.quantity}
                </div>
            </td>

            <td
                align="right"
                valign="top"
                style="
                    padding:16px 0;
                    border-bottom:1px solid #eeeeee;
                    font-size:15px;
                    font-weight:700;
                    color:#567C8D;
                    white-space:nowrap;
                "
            >
                ${float(item.price) * item.quantity:.2f}
            </td>
        </tr>
        """

    subtotal = sum(
        float(item.price) * item.quantity
        for item in order.items
    )

    delivery_fee = float(order.total_amount) - subtotal

    return f"""
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Order Confirmation</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f6f6f6;
    font-family:Arial, Helvetica, sans-serif;
    color:#1d1d1f;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background:#f6f6f6;"
    >
        <tr>
            <td align="center" style="padding:40px 15px;">

                <!-- Main container -->
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width:620px;
                        background:#ffffff;
                        border-radius:16px;
                        overflow:hidden;
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="padding:32px 30px 20px;"
                        >

                            <div style="
                                font-size:22px;
                                font-weight:800;
                                letter-spacing:1px;
                                color:#567C8D;
                            ">
                                BYTESTORE
                            </div>

                        </td>
                    </tr>


                    <!-- Confirmation -->
                    <tr>
                        <td
                            align="center"
                            style="padding:10px 30px 30px;"
                        >

                            <div style="
                                width:64px;
                                height:64px;
                                line-height:64px;
                                margin:0 auto 18px;
                                border-radius:50%;
                                background:#eef5f7;
                                color:#567C8D;
                                font-size:30px;
                                font-weight:700;
                            ">
                                ✓
                            </div>

                            <h1 style="
                                margin:0;
                                font-size:28px;
                                line-height:36px;
                                color:#1d1d1f;
                            ">
                                Order Confirmed
                            </h1>

                            <p style="
                                margin:10px 0 0;
                                font-size:15px;
                                line-height:24px;
                                color:#777777;
                            ">
                                Thank you for your order,
                                <strong>{order.customer_name}</strong>.
                            </p>

                            <p style="
                                margin:4px 0 0;
                                font-size:14px;
                                color:#777777;
                            ">
                                Order #{order.id}
                            </p>

                        </td>
                    </tr>


                    <!-- Order Summary -->
                    <tr>
                        <td style="padding:0 30px;">

                            <h2 style="
                                margin:0 0 10px;
                                font-size:16px;
                                font-weight:800;
                                letter-spacing:.3px;
                            ">
                                ORDER SUMMARY
                            </h2>

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >
                                {items_html}
                            </table>

                        </td>
                    </tr>


                    <!-- Totals -->
                    <tr>
                        <td style="padding:20px 30px 10px;">

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >

                                <tr>
                                    <td style="
                                        padding:5px 0;
                                        font-size:14px;
                                        color:#777777;
                                    ">
                                        Subtotal
                                    </td>

                                    <td
                                        align="right"
                                        style="
                                            padding:5px 0;
                                            font-size:14px;
                                            font-weight:600;
                                        "
                                    >
                                        ${subtotal:.2f}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:5px 0;
                                        font-size:14px;
                                        color:#777777;
                                    ">
                                        Delivery
                                    </td>

                                    <td
                                        align="right"
                                        style="
                                            padding:5px 0;
                                            font-size:14px;
                                            font-weight:600;
                                        "
                                    >
                                        ${delivery_fee:.2f}
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        style="
                                            padding:14px 0 5px;
                                            border-top:1px solid #eeeeee;
                                            font-size:17px;
                                            font-weight:800;
                                        "
                                    >
                                        Total
                                    </td>

                                    <td
                                        align="right"
                                        style="
                                            padding:14px 0 5px;
                                            border-top:1px solid #eeeeee;
                                            font-size:18px;
                                            font-weight:800;
                                            color:#567C8D;
                                        "
                                    >
                                        ${float(order.total_amount):.2f}
                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>


                    <!-- Delivery Information -->
                    <tr>
                        <td style="padding:25px 30px 10px;">

                            <h2 style="
                                margin:0 0 12px;
                                font-size:16px;
                                font-weight:800;
                                letter-spacing:.3px;
                            ">
                                DELIVERY INFORMATION
                            </h2>

                            <div style="
                                padding:16px;
                                background:#f8f8f8;
                                border-radius:10px;
                                font-size:14px;
                                line-height:23px;
                                color:#555555;
                            ">

                                <strong style="color:#1d1d1f;">
                                    {order.customer_name}
                                </strong>

                                <br>

                                {order.shipping_address}
                                <br>

                                {order.shipping_city},
                                {order.shipping_region}

                                {f"<br>{order.shipping_postal_code}"
                                if order.shipping_postal_code else ""}

                                <br>

                                {order.customer_phone}

                            </div>

                        </td>
                    </tr>


                    <!-- Payment -->
                    <tr>
                        <td style="padding:15px 30px 25px;">

                            <h2 style="
                                margin:0 0 12px;
                                font-size:16px;
                                font-weight:800;
                                letter-spacing:.3px;
                            ">
                                PAYMENT
                            </h2>

                            <div style="
                                padding:14px 16px;
                                background:#f8f8f8;
                                border-radius:10px;
                                font-size:14px;
                                color:#555555;
                            ">
                                <strong style="color:#1d1d1f;">
                                    Cash on delivery
                                </strong>

                                <br>

                                Pay when your order arrives.
                            </div>

                        </td>
                    </tr>


                    <!-- Button -->
                    <tr>
                        <td align="center" style="padding:5px 30px 35px;">

                            <a
                                href="https://your-domain.com/orders/{order.id}"
                                style="
                                    display:inline-block;
                                    padding:13px 28px;
                                    background:#567C8D;
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:9px;
                                    font-size:14px;
                                    font-weight:700;
                                "
                            >
                                View Your Order
                            </a>

                        </td>
                    </tr>


                    <!-- Footer -->
                    <tr>
                        <td
                            align="center"
                            style="
                                padding:22px 30px;
                                background:#fafafa;
                                border-top:1px solid #eeeeee;
                            "
                        >

                            <p style="
                                margin:0;
                                font-size:13px;
                                color:#888888;
                            ">
                                Thank you for shopping with ByteStore.
                            </p>

                            <p style="
                                margin:6px 0 0;
                                font-size:12px;
                                color:#aaaaaa;
                            ">
                                This is an automated confirmation email.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
"""