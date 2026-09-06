import smtplib
from email.message import EmailMessage
from html import escape
from decimal import Decimal

from core.config import settings
from models.order import Order


def send_order_confirmation(
    order: Order,
    customer_email: str,
) -> None:
    """
    Send a premium HTML order confirmation email.

    The email uses snapshot data stored in OrderItem so that
    historical orders remain accurate even if products change later.
    """

    # ---------------------------------------------------------
    # Build order items
    # ---------------------------------------------------------

    items_html = ""

    for item in order.items:
        attributes_html = ""

        if item.variant_attributes_snapshot:
            attributes = []

            for key, value in item.variant_attributes_snapshot.items():
                attributes.append(
                    f"""
                    <span style="
                        display:inline-block;
                        margin:3px 4px 3px 0;
                        padding:5px 9px;
                        background:#f3f5f6;
                        border-radius:6px;
                        font-size:11px;
                        color:#5f6b70;
                    ">
                        {escape(str(key))}: {escape(str(value))}
                    </span>
                    """
                )

            attributes_html = "".join(attributes)

        item_total = item.price * item.quantity

        items_html += f"""
        <tr>
            <td style="
                padding:20px 0;
                border-bottom:1px solid #eeeeee;
            ">
                <div style="
                    font-size:15px;
                    font-weight:600;
                    color:#151515;
                    margin-bottom:7px;
                ">
                    {escape(item.product_name)}
                </div>

                <div style="
                    font-size:12px;
                    color:#8a8a8a;
                    margin-bottom:6px;
                ">
                    Quantity: {item.quantity}
                </div>

                <div>
                    {attributes_html}
                </div>
            </td>

            <td style="
                padding:20px 0;
                border-bottom:1px solid #eeeeee;
                text-align:right;
                vertical-align:top;
                white-space:nowrap;
            ">
                <div style="
                    font-size:15px;
                    font-weight:600;
                    color:#151515;
                ">
                    {item_total:.2f} DH
                </div>

                <div style="
                    font-size:11px;
                    color:#999999;
                    margin-top:5px;
                ">
                    {item.price:.2f} DH × {item.quantity}
                </div>
            </td>
        </tr>
        """

    # ---------------------------------------------------------
    # Customer / shipping information
    # ---------------------------------------------------------

    customer_name = escape(order.customer_name)
    customer_phone = escape(order.customer_phone)

    shipping_address = escape(order.shipping_address)
    shipping_city = escape(order.shipping_city)
    shipping_region = escape(order.shipping_region)

    shipping_location = (
        f"{shipping_city}, {shipping_region}"
    )

    if order.shipping_postal_code:
        shipping_location += (
            f" {escape(order.shipping_postal_code)}"
        )

    # ---------------------------------------------------------
    # HTML email
    # ---------------------------------------------------------

    html_content = f"""
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>ByteStore Order Confirmation</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f4f6f7;
    font-family:Arial, Helvetica, sans-serif;
    color:#151515;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#f4f6f7;
        padding:40px 15px;
    "
>
<tr>
<td align="center">

<!-- =====================================================
     MAIN CONTAINER
===================================================== -->

<table
    width="600"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:600px;
        width:100%;
        background:#ffffff;
        border-radius:18px;
        overflow:hidden;
    "
>

<!-- =====================================================
     HEADER
===================================================== -->

<tr>
<td style="
    background:#567C8D;
    padding:34px 40px;
    text-align:center;
">

    <div style="
        font-size:27px;
        font-weight:700;
        letter-spacing:-0.7px;
        color:#ffffff;
    ">
        ByteStore
    </div>

    <div style="
        margin-top:8px;
        font-size:12px;
        letter-spacing:0.5px;
        color:#e8eff2;
    ">
        TECHNOLOGY. SIMPLIFIED.
    </div>

</td>
</tr>


<!-- =====================================================
     HERO
===================================================== -->

<tr>
<td style="
    padding:42px 40px 25px 40px;
">

    <div style="
        font-size:11px;
        font-weight:700;
        letter-spacing:1.8px;
        color:#567C8D;
        text-transform:uppercase;
        margin-bottom:12px;
    ">
        Order Confirmed
    </div>

    <div style="
        font-size:28px;
        line-height:1.25;
        font-weight:700;
        letter-spacing:-0.7px;
        color:#151515;
        margin-bottom:13px;
    ">
        Thank you, {customer_name}.
    </div>

    <div style="
        font-size:14px;
        line-height:1.7;
        color:#707070;
    ">
        Your order has been successfully received.
        We'll keep you updated as it moves through
        the delivery process.
    </div>

</td>
</tr>


<!-- =====================================================
     ORDER NUMBER CARD
===================================================== -->

<tr>
<td style="padding:0 40px 25px 40px;">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
            background:#f7f9fa;
            border-radius:12px;
        "
    >

    <tr>

        <td style="padding:18px 20px;">

            <div style="
                font-size:10px;
                color:#929292;
                text-transform:uppercase;
                letter-spacing:1px;
                margin-bottom:6px;
            ">
                Order number
            </div>

            <div style="
                font-size:16px;
                font-weight:700;
                color:#151515;
            ">
                #{order.id}
            </div>

        </td>

        <td
            style="
                padding:18px 20px;
                text-align:right;
            "
        >

            <div style="
                font-size:10px;
                color:#929292;
                text-transform:uppercase;
                letter-spacing:1px;
                margin-bottom:6px;
            ">
                Payment
            </div>

            <div style="
                font-size:13px;
                font-weight:600;
                color:#567C8D;
            ">
                Cash on Delivery
            </div>

        </td>

    </tr>

    </table>

</td>
</tr>


<!-- =====================================================
     ITEMS
===================================================== -->

<tr>
<td style="padding:0 40px;">

    <div style="
        font-size:12px;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:1.2px;
        color:#333333;
        margin-bottom:4px;
    ">
        Your items
    </div>

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


<!-- =====================================================
     TOTAL
===================================================== -->

<tr>
<td style="padding:25px 40px 30px 40px;">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
    >

        <tr>
            <td style="
                font-size:14px;
                color:#777777;
                padding-bottom:10px;
            ">
                Subtotal
            </td>

            <td style="
                text-align:right;
                font-size:14px;
                color:#333333;
                padding-bottom:10px;
            ">
                {order.total_amount:.2f} DH
            </td>
        </tr>

        <tr>
            <td style="
                border-top:1px solid #e9e9e9;
                padding-top:17px;
                font-size:16px;
                font-weight:700;
                color:#151515;
            ">
                Total
            </td>

            <td style="
                border-top:1px solid #e9e9e9;
                padding-top:17px;
                text-align:right;
                font-size:20px;
                font-weight:700;
                color:#567C8D;
            ">
                {order.total_amount:.2f} DH
            </td>
        </tr>

    </table>

</td>
</tr>


<!-- =====================================================
     SHIPPING
===================================================== -->

<tr>
<td style="
    padding:0 40px 35px 40px;
">

    <div style="
        font-size:12px;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:1.2px;
        color:#333333;
        margin-bottom:14px;
    ">
        Delivery details
    </div>

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
            background:#fafafa;
            border-radius:12px;
        "
    >

        <tr>
            <td style="padding:18px 20px;">

                <div style="
                    font-size:13px;
                    font-weight:600;
                    color:#222222;
                    margin-bottom:7px;
                ">
                    {customer_name}
                </div>

                <div style="
                    font-size:13px;
                    line-height:1.7;
                    color:#707070;
                ">
                    {shipping_address}<br>
                    {shipping_location}<br>
                    {customer_phone}
                </div>

            </td>
        </tr>

    </table>

</td>
</tr>


<!-- =====================================================
     FOOTER MESSAGE
===================================================== -->

<tr>
<td style="
    background:#f7f9fa;
    padding:28px 40px;
    text-align:center;
">

    <div style="
        font-size:13px;
        font-weight:600;
        color:#333333;
        margin-bottom:7px;
    ">
        Thank you for choosing ByteStore.
    </div>

    <div style="
        font-size:11px;
        line-height:1.6;
        color:#929292;
    ">
        If you have any questions about your order,
        please contact our support team.
    </div>

</td>
</tr>


<!-- =====================================================
     BRAND FOOTER
===================================================== -->

<tr>
<td style="
    padding:22px 40px;
    text-align:center;
    background:#ffffff;
">

    <div style="
        font-size:14px;
        font-weight:700;
        color:#567C8D;
        margin-bottom:6px;
    ">
        ByteStore
    </div>

    <div style="
        font-size:10px;
        color:#aaaaaa;
    ">
        © ByteStore. All rights reserved.
    </div>

</td>
</tr>

</table>

<!-- END MAIN CONTAINER -->

</td>
</tr>
</table>

</body>
</html>
"""

    # ---------------------------------------------------------
    # Plain-text fallback
    # ---------------------------------------------------------

    text_items = []

    for item in order.items:
        item_total = item.price * item.quantity

        attributes = ""

        if item.variant_attributes_snapshot:
            attributes = " | " + ", ".join(
                f"{key}: {value}"
                for key, value in item.variant_attributes_snapshot.items()
            )

        text_items.append(
            f"- {item.product_name}{attributes}\n"
            f"  Quantity: {item.quantity}\n"
            f"  Price: {item.price:.2f} DH\n"
            f"  Total: {item_total:.2f} DH"
        )

    text_content = f"""
ByteStore
TECHNOLOGY. SIMPLIFIED.

ORDER CONFIRMED

Thank you, {order.customer_name}.

Your order #{order.id} has been successfully received.

YOUR ITEMS
----------

{chr(10).join(text_items)}

TOTAL
-----

{order.total_amount:.2f} DH

DELIVERY DETAILS
----------------

{order.customer_name}
{order.shipping_address}
{order.shipping_city}, {order.shipping_region}
{order.shipping_postal_code or ""}
{order.customer_phone}

Payment: Cash on Delivery

Thank you for choosing ByteStore.
"""

    # ---------------------------------------------------------
    # Create email
    # ---------------------------------------------------------

    message = EmailMessage()

    message["From"] = f"ByteStore <{settings.SMTP_USER}>"
    message["To"] = customer_email
    message["Subject"] = (
        f"ByteStore — Order #{order.id} Confirmed"
    )

    # Plain-text version
    message.set_content(text_content)

    # HTML version
    message.add_alternative(
        html_content,
        subtype="html",
    )

    # ---------------------------------------------------------
    # Send through Gmail SMTP
    # ---------------------------------------------------------

    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
    ) as server:

        server.starttls()

        server.login(
            settings.SMTP_USER,
            settings.SMTP_PASSWORD,
        )

        server.send_message(message)
