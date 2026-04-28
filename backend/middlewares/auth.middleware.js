import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Falta token (Bearer)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      idUsuario: decoded.sub,
      rol: decoded.rol,
    };

    return next();
  } catch (err) {
    console.log("[AUTH VERIFY ERROR]", err?.name, err?.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador" });
  }

  next();
};

export const verificarAdminOEmpleado = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.user.rol !== "admin" && req.user.rol !== "empleado") {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador o empleado" });
  }

  next();
};

export const auth = verificarToken;