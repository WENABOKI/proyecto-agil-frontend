import { useEffect, useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Carrera {
  codigo: string;
  nombre: string;
  catalogo: string;
}

interface UserData {
  rut: string;
  carreras: Carrera[];
}

interface Ramo {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prerequisitos: string[];
}

const nivelToRoman = (nivel: number) => {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return romans[nivel - 1] ?? String(nivel);
};

export default function MiMalla() {
  const [user, setUser] = useState<UserData | null>(null);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<Carrera | null>(null);
  const [malla, setMalla] = useState<Ramo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(raw);
    const data: UserData = {
      rut: parsed.rut,
      carreras: parsed.carreras || [],
    };

    setUser(data);

    if (data.carreras.length > 0) {
      setCarreraSeleccionada(data.carreras[0]);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchMalla = async () => {
      if (!carreraSeleccionada) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(
          `http://localhost:3000/carrers/malla/${carreraSeleccionada.codigo}/${carreraSeleccionada.catalogo}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.message || "Error al obtener la malla.");
          setMalla([]);
          return;
        }

        if (!Array.isArray(data)) {
          setErrorMsg("Formato de malla inválido desde el servidor.");
          setMalla([]);
          return;
        }

        setMalla(data);
      } catch {
        setErrorMsg("No se pudo conectar con el servidor.");
        setMalla([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMalla();
  }, [carreraSeleccionada]);

  const niveles: Record<number, Ramo[]> = {};
  if (Array.isArray(malla)) {
    malla.forEach((r) => {
      if (!niveles[r.nivel]) niveles[r.nivel] = [];
      niveles[r.nivel].push(r);
    });
  }

  const nivelesOrdenados = Object.keys(niveles)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#2D5F8F] flex items-center gap-2">
              <GraduationCap size={28} className="text-[#2D5F8F]" />
              Mi Malla Curricular
            </h1>
            {user && (
              <p className="text-sm text-slate-600 mt-1">
                RUT: <span className="font-semibold">{user.rut}</span>
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 size={18} className="animate-spin" />
            <span>Cargando malla...</span>
          </div>
        )}

        {errorMsg && <p className="text-red-500 font-medium mb-4">{errorMsg}</p>}

        {!loading && !errorMsg && nivelesOrdenados.length > 0 && (
          <div className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
              {nivelesOrdenados.map((nivel) => (
                <div
                  key={nivel}
                  className="bg-slate-200/80 rounded-xl shadow-inner flex flex-col h-full"
                >
                  <div className="bg-[#2D5F8F] text-white text-center py-2 rounded-t-xl font-semibold tracking-wide">
                    {nivelToRoman(nivel)}
                  </div>

                  <div className="p-3 space-y-3">
                    {niveles[nivel].map((ramo) => (
                      <div
                        key={ramo.codigo}
                        className="bg-white rounded-lg border border-slate-200 shadow-sm px-3 py-3 text-xs leading-tight"
                      >
                        <p className="font-semibold text-slate-700 text-[0.75rem] tracking-tight">
                          {ramo.codigo}
                        </p>
                        <p className="text-[0.8rem] text-slate-900 mt-1">
                          {ramo.asignatura}
                        </p>
                        <div className="mt-2 text-[0.7rem] text-slate-600">
                          {ramo.creditos} SCT
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !errorMsg && malla.length === 0 && carreraSeleccionada && (
          <p className="text-slate-600 mt-4">
            No se encontraron asignaturas para esta malla.
          </p>
        )}
      </div>
    </div>
  );
}
