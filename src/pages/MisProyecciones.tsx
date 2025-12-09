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

// Ramo en la proyección
interface RamoProyeccion {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
  estado?: string;
  disponible?: boolean;
  oportunidad?: number;
  prioridad?: number;
}

interface ProyeccionSemestre {
  semestre: number;          // ej: 202610
  creditosTotales: number;
  ramos: RamoProyeccion[];
}

// Formatea 202610 -> "2026-10"
const formatSemestre = (semestre: number) => {
  const s = semestre.toString();
  if (s.length !== 6) return s;
  const year = s.slice(0, 4);
  const periodo = s.slice(4, 6);
  return `${year}-${periodo}`;
};

export default function Proyeccion() {
  const [user, setUser] = useState<UserData | null>(null);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<Carrera | null>(null);

  const [proyeccion, setProyeccion] = useState<ProyeccionSemestre[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  // Recuperar usuario desde localStorage
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

  // Llamar backend para obtener la proyección SOLO si hay marca en sessionStorage
  useEffect(() => {
    const fetchProyeccion = async () => {
      if (!carreraSeleccionada || !user) return;

      // 👇 clave usada cuando generas la proyección en MiMalla
      const key = `projectionGenerated:${user.rut}:${carreraSeleccionada.codigo}-${carreraSeleccionada.catalogo}`;

      // Si NO existe la marca → no hay proyección generada
      if (!sessionStorage.getItem(key)) {
        setProyeccion([]);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(
          `http://localhost:3000/projection/automatica/${carreraSeleccionada.codigo}/${carreraSeleccionada.catalogo}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
          setErrorMsg("Error al obtener la proyección académica.");
          return;
        }

        const ordenada = (data as ProyeccionSemestre[]).sort(
          (a, b) => a.semestre - b.semestre
        );

        setProyeccion(ordenada);
      } catch (error) {
        console.error(error);
        setErrorMsg("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchProyeccion();
  }, [carreraSeleccionada, user]);

  const totalGeneral = proyeccion.reduce(
    (sum, p) => sum + p.creditosTotales,
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Título */}
        <h1 className="text-3xl font-bold text-[#2D5F8F] flex items-center gap-2 mb-4">
          <GraduationCap size={28} className="text-[#2D5F8F]" />
          Proyección Académica
        </h1>

        {/* Resumen */}
        {proyeccion.length > 0 && (
          <p className="text-sm text-slate-600 mb-4">
            Semestres proyectados:{" "}
            <span className="font-semibold">{proyeccion.length}</span>
            {" — "}
            Créditos totales proyectados:{" "}
            <span className="font-semibold">{totalGeneral}</span>
          </p>
        )}

        {/* Selector de carrera, mismo estilo que MiMalla */}
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
            <span>Cargando proyección...</span>
          </div>
        )}

        {/* Error */}
        {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}

        {/* Proyección con estilo similar a MiMalla, pero ramos SIEMPRE neutros */}
        {!loading && !errorMsg && proyeccion.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 mt-6">
            {proyeccion.map((sem) => (
              <div
                key={sem.semestre}
                className="bg-slate-200/80 rounded-xl shadow-inner"
              >
                {/* Header azul del semestre */}
                <div className="bg-[#2D5F8F] text-white text-center py-2 rounded-t-xl font-semibold text-sm">
                  {formatSemestre(sem.semestre)}
                  <span className="block text-[0.7rem] font-normal">
                    {sem.creditosTotales} SCT
                  </span>
                </div>

                {/* Ramos proyectados en ese semestre */}
                <div className="p-3 space-y-3">
                  {sem.ramos.map((ramo) => (
                    <div
                      key={ramo.codigo}
                      className="rounded-lg px-3 py-3 text-xs shadow-sm border bg-white border-slate-200 text-slate-900"
                    >
                      <p className="font-semibold text-[0.75rem]">
                        {ramo.codigo}
                      </p>
                      <p className="text-[0.8rem] mt-1">
                        {ramo.asignatura}
                      </p>

                      <div className="mt-2 text-[0.7rem]">
                        {ramo.creditos} SCT
                      </div>
                    </div>
                  ))}

                  {sem.ramos.length === 0 && (
                    <p className="text-xs text-slate-500">
                      Sin ramos sugeridos para este semestre.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !errorMsg && proyeccion.length === 0 && carreraSeleccionada && (
          <p className="mt-6 text-slate-600">
            No hay proyección disponible para esta carrera.
          </p>
        )}
      </div>
    </div>
  );
}
