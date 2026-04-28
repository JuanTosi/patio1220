import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass:process.env.SMTP_PASS
  }
})

 export const enviarRecuperarContrasena = async (email, link) =>{
  const htmlTemplate= 
`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Recuperar contraseña</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

<table align="center" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="500" cellpadding="20" cellspacing="0" style="background:white; margin-top:40px; border-radius:8px;">

<tr>
<td align="center">

<h2 style="color:#333;">Recuperar contraseña</h2>

<p style="color:#555;">
Recibimos una solicitud para restablecer tu contraseña.
</p>

<p style="color:#555;">
Haz clic en el siguiente botón para crear una nueva contraseña.
</p>

<a href="${link}" 
style="
display:inline-block;
padding:12px 25px;
background-color:#4CAF50;
color:white;
text-decoration:none;
border-radius:5px;
margin-top:15px;
font-weight:bold;
">
Restablecer contraseña
</a>

<p style="margin-top:25px; font-size:14px; color:#777;">
Si el botón no funciona, copia y pega este enlace en tu navegador:
</p>

<p style="word-break:break-all; color:#0066cc;">
${link}
</p>

<hr style="margin-top:30px;">

<p style="font-size:12px; color:#999;">
Si no solicitaste este cambio, puedes ignorar este correo.
Tu contraseña no será modificada.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`

 try {

    await transporter.sendMail({
      from: `"Soporte Sistema" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Recuperar contraseña",
      html: htmlTemplate
    });

    console.log("Email enviado correctamente");

  } catch (error) {
    console.error("Error enviando email:", error);
  throw error;
  }

}
  export const enviarEmailRegistro = async (email, nombre) => {
    console.log("Intentando enviar mail a:", email);
  try {
    await transporter.sendMail({
      from: `"Patio 1220" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "¡Bienvenido a Patio 1220!",
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Registro exitoso</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

<table align="center" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="500" cellpadding="20" cellspacing="0" style="background:white; margin-top:40px; border-radius:8px;">

<tr>
<td align="center">

<h2 style="color:#333;">¡Bienvenido/a ${nombre}!</h2>

<p style="color:#555;">
Tu cuenta se ha registrado correctamente.
</p>

<p style="color:#555;">
Ahora puedes iniciar sesión en el sistema utilizando tu correo electrónico y contraseña.
</p>

<a href="${process.env.FRONTEND_URL}/login" 
style="
display:inline-block;
padding:12px 25px;
background-color:#4CAF50;
color:white;
text-decoration:none;
border-radius:5px;
margin-top:15px;
font-weight:bold;
">
Iniciar sesión
</a>

<p style="margin-top:25px; font-size:14px; color:#777;">
Si el botón no funciona, copia y pega este enlace en tu navegador:
</p>

<p style="word-break:break-all; color:#0066cc;">
${process.env.FRONTEND_URL}/login
</p>

<hr style="margin-top:30px;">

<p style="font-size:12px; color:#999;">
Gracias por registrarte en nuestro sistema.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`
    });

  } catch (error) {
    console.log("Error al enviar mail:", error.message)
     throw error; 
  }
};





export const enviarEmailReserva = async (email, nombre, idReserva, productos, total, tipoEntrega, metodoPago) => {
  console.log("Intentando enviar mail de reserva a:", email);

  const filasProductos = productos.map(item => `
    <tr>
      <td style="padding:8px; border-bottom:1px solid #eee;">${item.nombreProducto}</td>
      <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.cantidad}</td>
      <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">$${Number(item.precioUnitario).toFixed(2)}</td>
    </tr>
  `).join("");

  const entregaTexto = tipoEntrega === "retiro_local" ? "Retiro en local" : "Envío a domicilio";

  try {
    await transporter.sendMail({
      from: `"Patio 1220" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Confirmación de reserva #${idReserva} - Patio 1220`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirmación de reserva</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <table align="center" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table width="550" cellpadding="20" cellspacing="0" style="background:white; margin-top:40px; border-radius:8px;">
          <tr>
            <td align="center">

              <h2 style="color:#333;">¡Reserva confirmada, ${nombre}!</h2>

              <p style="color:#555;">
                Tu reserva fue registrada correctamente en nuestro sistema.
              </p>

              <!-- Número de reserva destacado -->
              <div style="
                background-color:#f0fff4;
                border:2px solid #28a745;
                border-radius:8px;
                padding:15px;
                margin:20px 0;
              ">
                <p style="margin:0; font-size:18px; color:#28a745; font-weight:bold;">
                  Reserva #${idReserva}
                </p>
              </div>

              <!-- Detalle de la reserva -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; text-align:left;">
                <tr>
                  <td style="padding:6px 0; color:#555;"><strong>Tipo de entrega:</strong></td>
                  <td style="padding:6px 0; color:#333;">${entregaTexto}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#555;"><strong>Método de pago:</strong></td>
                  <td style="padding:6px 0; color:#333;">${metodoPago}</td>
                </tr>
              </table>

              <!-- Tabla de productos -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background-color:#f8f8f8;">
                    <th style="padding:10px 8px; text-align:left; border-bottom:2px solid #ddd; color:#333;">Producto</th>
                    <th style="padding:10px 8px; text-align:center; border-bottom:2px solid #ddd; color:#333;">Cantidad</th>
                    <th style="padding:10px 8px; text-align:right; border-bottom:2px solid #ddd; color:#333;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasProductos}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:10px 8px; text-align:right; font-weight:bold; color:#333;">Total:</td>
                    <td style="padding:10px 8px; text-align:right; font-weight:bold; font-size:16px; color:#28a745;">
                      $${Number(total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <hr style="margin-top:30px;">

              <p style="font-size:12px; color:#999;">
                Si tenés alguna duda sobre tu reserva, no dudes en contactarnos.
              </p>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
      `
    });

    console.log(`Email de reserva #${idReserva} enviado a ${email}`);

  } catch (error) {
    console.error("Error al enviar mail de reserva:", error.message);
    throw error;
  }
};
