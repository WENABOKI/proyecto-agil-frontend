import { useState } from "react";
import { TextField, Button, Card, CardContent } from "@mui/material";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: rut,
        password: password,
      }),
    });

    const data = await response.json()

    if (response.ok) {
      console.log("Login exitoso:", { rut, password });
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/fondo.webp")',
        }}
      >
        <div className="absolute inset-0 bg-blue-900/40"></div>
      </div>

      <header className="relative z-10 flex justify-between items-center px-4 md:px-8 py-4 bg-[#2D4A6F]/80 backdrop-blur-sm">
        <div className="flex items-center">
          <img
            src="/images/logo1.webp"
            alt="UCN Logo"
            className="h-14 md:h-16 w-auto object-contain"
          />
        </div>

        <div className="flex items-center">
          <img
            src="/images/logo2.svg"
            alt="UCN Edomus"
            className="h-12 md:h-14 w-auto object-contain drop-shadow-lg"
          />
        </div>
      </header>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-[#2D5F8F] mb-2">
              ¡Bienvenid@!
            </h1>

            <p className="text-center text-gray-600 text-sm mb-6">
              Para iniciar sesión debes ingresar tus credenciales de{" "}
              <span className="text-[#2D5F8F] font-semibold">Online UCN</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  RUT
                </label>
                <TextField
                  fullWidth
                  placeholder="Escribe tu RUT"
                  variant="outlined"
                  size="small"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F9FAFB",
                      "&:hover fieldset": {
                        borderColor: "#2D5F8F",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2D5F8F",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Escribe tu contraseña"
                  variant="outlined"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F9FAFB",
                      "&:hover fieldset": {
                        borderColor: "#2D5F8F",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2D5F8F",
                      },
                    },
                  }}
                />
              </div>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LogIn size={20} />}
                sx={{
                  backgroundColor: "#FF8A5B",
                  color: "white",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  py: 1.5,
                  mt: 2,
                  borderRadius: "6px",
                  "&:hover": {
                    backgroundColor: "#FF7043",
                  },
                }}
              >
                Iniciar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
