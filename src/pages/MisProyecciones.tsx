import { useEffect, useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface Carrera {
  codigo: string;
  nombre: string;
  catalogo: string;
}

interface UserData {
  rut: string;
  carreras: Carrera[];
}

interface CursoProyectado {
  codigo: string;
  asignatura: string;
  creditos: number;
  semestreSugerido: number;
  nivel?: number;
}

interface ProyeccionResponse {
  message: string;
  rut: string;
  carrera: string;
  totalCreditos: number;
  cursosSugeridos: CursoProyectado[];
}

// ===============================
//   CONVERSOR ROMANO 1–20 SIMPLE
// ===============================
const numeroToRoman = (n: number) => {
  const romans = [
    "", // índice 0 no se usa
    "I", "II", "III", "IV", "V",
    "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV",
    "XVI", "XVII", "XVIII", "XIX", "XX"
  ];
  return romans[n] ?? String(n);
};

export default function Proyeccion() {
  const [user, setUser] = useState<UserData | null>(null);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<Carrera | null>(null);
  const [proyeccion, setProyeccion] = useState<CursoProyectado[]>([]);
  const [meta, setMeta] = useState<Omit<ProyeccionResponse, "cursosSugeridos"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [proyeccionSolicitada, setProyeccionSolicitada] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 1) Recuperar usuario y carrera seleccionada desde localStorage
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

  // 2) (Opcional) Si alguna vez llegas con state.generar desde otro lado
  useEffect(() => {
    const state = location.state as any;
    if (state?.generar) {
      setProyeccionSolicitada(true);
    }
  }, [location.state]);

  // 3) Leer de sessionStorage si ya se había generado proyección en esta sesión
  useEffect(() => {
    if (!user || !carreraSeleccionada) return;

    const key = `projectionGenerated:${user.rut}:${carreraSeleccionada.codigo}-${carreraSeleccionada.catalogo}`;
    const flag = sessionStorage.getItem(key);

    if (flag === "true") {
      setProyeccionSolicitada(true);
    }
  }, [user, carreraSeleccionada]);

  // 4) Cada vez que proyeccionSolicitada pase a true y tengamos user + carrera,
  //    guardar el flag en sessionStorage (para esta sesión)
  useEffect(() => {
    if (!proyeccionSolicitada || !user || !carreraSeleccionada) return;

    const key = `projectionGenerated:${user.rut}:${carreraSeleccionada.codigo}-${carreraSeleccionada.catalogo}`;
    sessionStorage.setItem(key, "true");
  }, [proyeccionSolicitada, user, carreraSeleccionada]);

  // 5) Cuando cambia la carrera Y ya se solicitó proyección, pedirla al backend
  useEffect(() => {
    const fetchProyeccion = async () => {
      if (!carreraSeleccionada || !proyeccionSolicitada) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(
          `http://localhost:3000/carrers/projection/auto/${carreraSeleccionada.codigo}/${carreraSeleccionada.catalogo}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok || !Array.isArray(data.cursosSugeridos)) {
          setErrorMsg("Error al obtener la proyección académica.");
          setProyeccion([]);
          setMeta(null);
          return;
        }

        setProyeccion(data.cursosSugeridos);
        setMeta({
          message: data.message,
          rut: data.rut,
          carrera: data.carrera,
          totalCreditos: data.totalCreditos,
        });
      } catch {
        setErrorMsg("No se pudo conectar con el servidor.");
        setProyeccion([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProyeccion();
  }, [carreraSeleccionada, proyeccionSolicitada]);

  // 6) Agrupar por semestreSugerido (semestres restantes)
  const semestres: Record<number, CursoProyectado[]> = {};
  if (Array.isArray(proyeccion)) {
    proyeccion.forEach((r) => {
      const sem = r.semestreSugerido ?? 1;
      if (!semestres[sem]) semestres[sem] = [];
      semestres[sem].push(r);
    });
  }

  const semestresOrdenados = Object.keys(semestres)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#2D5F8F] flex items-center gap-2">
              <GraduationCap size={28} className="text-[#2D5F8F]" />
              Proyección Académica
            </h1>
            {user && (
              <p className="text-sm text-slate-600 mt-1">
                RUT: <span className="font-semibold">{user.rut}</span>
              </p>
            )}
            {carreraSeleccionada && (
              <p className="text-xs text-slate-600 mt-1">
                Carrera:{" "}
                <span className="font-semibold">
                  {carreraSeleccionada.nombre} (
                  {carreraSeleccionada.codigo}-{carreraSeleccionada.catalogo})
                </span>
              </p>
            )}
          </div>
        </div>

        {/* BOTONES DE CARRERA (si tiene más de una) */}
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
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
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

        {/* SI NO SE HA SOLICITADO NINGUNA PROYECCIÓN EN ESTA SESIÓN */}
        {!proyeccionSolicitada && !loading && !errorMsg && (
          <p className="text-slate-600 mt-6 text-center">
            El alumno aún no ha generado ninguna proyección académica.
          </p>
        )}

        {/* ESTADOS DE CARGA / ERROR */}
        {loading && (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 size={18} className="animate-spin" />
            <span>Calculando proyección...</span>
          </div>
        )}

        {errorMsg && (
          <p className="text-red-500 font-medium mb-4">{errorMsg}</p>
        )}

        {/* GRID DE SEMESTRES RESTANTES (solo si hubo solicitud y hay datos) */}
        {!loading &&
          !errorMsg &&
          proyeccionSolicitada &&
          semestresOrdenados.length > 0 && (
            <div className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                {semestresOrdenados.map((semestre) => (
                  <div
                    key={semestre}
                    className="bg-slate-200/80 rounded-xl shadow-inner flex flex-col h-full"
                  >
                    <div className="bg-[#2D5F8F] text-white text-center py-2 rounded-t-xl font-semibold tracking-wide">
                      {numeroToRoman(semestre)}
                    </div>

                    <div className="p-3 space-y-3">
                      {semestres[semestre].map((ramo) => (
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

        {/* SIN RESULTADOS DESPUÉS DE GENERAR */}
        {proyeccionSolicitada &&
          !loading &&
          !errorMsg &&
          proyeccion.length === 0 &&
          carreraSeleccionada && (
            <p className="text-slate-600 mt-4">
              No se encontraron ramos proyectados para esta carrera.
            </p>
          )}
      </div>
    </div>
  );
}
