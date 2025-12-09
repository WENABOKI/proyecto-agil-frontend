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
  prereq: string;
  estado?: string;
  disponible?: boolean;
}

const nivelToRoman = (nivel: number) => {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return romans[nivel - 1] ?? String(nivel);
};

// Colores del ramo según estado
const getRamoClasses = (ramo: Ramo) => {
  if (ramo.estado === "APROBADO")
    return "bg-green-100 border-green-300 text-green-900";

  if (ramo.estado === "REPROBADO")
    return "bg-red-100 border-red-300 text-red-900";

  if (ramo.estado === "INSCRITO")
    return "bg-yellow-100 border-yellow-300 text-yellow-900";

  if (ramo.disponible === false)
    return "bg-slate-200 border-slate-300 text-slate-500";

  return "bg-white border-slate-200 text-slate-900";
};

export default function MiMalla() {
  const [user, setUser] = useState<UserData | null>(null);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<Carrera | null>(null);
  const [malla, setMalla] = useState<Ramo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // Obtener usuario
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
    if (data.carreras.length > 0) setCarreraSeleccionada(data.carreras[0]);
  }, [navigate]);

  // Obtener malla desde backend
  useEffect(() => {
    const fetchMalla = async () => {
      if (!carreraSeleccionada || !user) return;

      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(
          `http://localhost:3000/mimalla/${carreraSeleccionada.codigo}/${carreraSeleccionada.catalogo}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok || !data || !Array.isArray(data.asignaturas)) {
          setErrorMsg("Error al obtener la malla.");
          setMalla([]);
          return;
        }

        setMalla(data.asignaturas as Ramo[]);
      } catch {
        setErrorMsg("No se pudo conectar con el servidor.");
        setMalla([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMalla();
  }, [carreraSeleccionada, user]);

  // Agrupar por niveles
  const niveles: Record<number, Ramo[]> = {};
  malla.forEach((r) => {
    if (!niveles[r.nivel]) niveles[r.nivel] = [];
    niveles[r.nivel].push(r);
  });

  const nivelesOrdenados = Object.keys(niveles)
    .map(Number)
    .sort((a, b) => a - b);

  const handleGenerarProyeccion = () => {
    if (!user || !carreraSeleccionada) {
      window.alert("Falta información para generar la proyección.");
      return;
    }

    const confirmar = window.confirm("¿Generar proyección académica?");
    if (!confirmar) return;

    const key = `projectionGenerated:${user.rut}:${carreraSeleccionada.codigo}-${carreraSeleccionada.catalogo}`;
    sessionStorage.setItem(key, "true");

    window.alert('Proyección generada. Puedes verla en "Mis proyecciones".');
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-[#2D5F8F] flex items-center gap-2 mb-4">
          <GraduationCap size={28} className="text-[#2D5F8F]" />
          Mi Malla Curricular
        </h1>

        {user && (
          <p className="text-sm text-slate-600 mb-4">
            RUT: <span className="font-semibold">{user.rut}</span>
          </p>
        )}

        <button
          onClick={handleGenerarProyeccion}
          className="inline-flex flex-col px-5 py-3 rounded-lg shadow-md bg-[#0f607a] text-white hover:bg-[#0c4d60] mb-6"
        >
          <span className="text-sm font-semibold">Proyección académica</span>
          <span className="text-xs">Generar sugerencia de semestres restantes</span>
        </button>

        {/* Selector de carrera */}
        {user && user.carreras.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {user.carreras.map((c) => {
              const active =
                carreraSeleccionada?.codigo === c.codigo &&
                carreraSeleccionada?.catalogo === c.catalogo;

              return (
                <button
                  key={`${c.codigo}-${c.catalogo}`}
                  onClick={() => setCarreraSeleccionada(c)}
                  className={`px-4 py-2 rounded-full text-sm border ${
                    active
                      ? "bg-[#2D5F8F] text-white border-[#2D5F8F]"
                      : "bg-white text-[#2D5F8F] border-[#2D5F8F] hover:bg-[#e0ebf7]"
                  }`}
                >
                  {c.nombre} ({c.catalogo})
                </button>
              );
            })}
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 size={18} className="animate-spin" />
            <span>Cargando malla...</span>
          </div>
        )}

        {/* Error */}
        {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}

        {/* Malla */}
        {!loading && !errorMsg && nivelesOrdenados.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 mt-6">
            {nivelesOrdenados.map((nivel) => (
              <div key={nivel} className="bg-slate-200/80 rounded-xl shadow-inner">
                <div className="bg-[#2D5F8F] text-white text-center py-2 rounded-t-xl font-semibold">
                  {nivelToRoman(nivel)}
                </div>

                <div className="p-3 space-y-3">
                  {niveles[nivel].map((ramo) => (
                    <div
                      key={ramo.codigo}
                      className={`rounded-lg px-3 py-3 text-xs shadow-sm border ${getRamoClasses(ramo)}`}
                    >
                      <p className="font-semibold text-[0.75rem]">{ramo.codigo}</p>
                      <p className="text-[0.8rem] mt-1">{ramo.asignatura}</p>

                      <div className="mt-2 text-[0.7rem]">{ramo.creditos} SCT</div>

                      {/* 🔥 Nuevo: Prerrequisitos usando nombre del ramo */}
                      <div className="mt-1 text-[0.65rem] text-slate-600">
                        <span className="font-semibold">Prerrequisitos:</span>{" "}
                        {ramo.prereq && ramo.prereq.trim() !== "" ? (
                          <span className="relative group cursor-pointer text-blue-600">
                            {ramo.prereq.split(",").length} cursos ⓘ

                            {/* Tooltip */}
                            <div className="absolute hidden group-hover:block top-4 left-0 z-20 w-64 p-2 bg-white border rounded shadow-lg text-[0.65rem] leading-tight">

                              {ramo.prereq.split(",").map((codigo) => {
                                const ramoEncontrado = malla.find(
                                  (x) => x.codigo === codigo.trim()
                                );
                                return (
                                  <div key={codigo} className="py-[2px]">
                                    {ramoEncontrado
                                      ? `${ramoEncontrado.asignatura} (${codigo.trim()})`
                                      : codigo.trim()}
                                  </div>
                                );
                              })}

                            </div>
                          </span>
                        ) : (
                          "Sin prerrequisitos"
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !errorMsg && malla.length === 0 && carreraSeleccionada && (
          <p>No se encontraron asignaturas.</p>
        )}
      </div>
    </div>
  );
}
