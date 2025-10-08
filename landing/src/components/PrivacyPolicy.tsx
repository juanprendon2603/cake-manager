import { ArrowLeft, Mail, Phone, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  // Llevar al tope al entrar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 text-gray-900">
      {/* Header compacto */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-white/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="InManager"
              className="w-8 h-8 rounded-xl"
            />
            <span className="text-lg font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
              InManager
            </span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/60 bg-white/70 hover:bg-white transition text-[#8E2DA8] text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </header>

      {/* Contenido */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Tarjeta principal */}
        <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-[0_20px_50px_rgba(142,45,168,0.12)] animate-fade-in-up">
          {/* Franja superior con degradado sutil */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] opacity-10" />

          <div className="relative p-6 sm:p-8">
            {/* Header de la tarjeta */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl grid place-items-center text-white bg-gradient-to-br from-[#8E2DA8] to-[#A855F7] shadow">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  Política de Privacidad
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Última actualización: Octubre 2025
                </p>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-800">
              <p>
                En <strong>InManager</strong> valoramos y respetamos tu
                privacidad. Esta Política explica cómo recopilamos, usamos y
                protegemos tus datos personales cuando usas nuestra plataforma.
              </p>

              <h2 className="text-[#8E2DA8]">1. Quiénes somos</h2>
              <p>
                InManager es una plataforma web desarrollada por{" "}
                <strong>Juan Pablo Rendón</strong>, diseñada para pequeños
                negocios.
              </p>
              <ul>
                <li>
                  📧{" "}
                  <a
                    className="text-[#8E2DA8] hover:underline"
                    href="mailto:juanprendon2603@gmail.com"
                  >
                    juanprendon2603@gmail.com
                  </a>
                </li>
                <li>
                  📱{" "}
                  <a
                    className="text-[#8E2DA8] hover:underline"
                    href="https://wa.me/573168878200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +57 316 887 8200
                  </a>
                </li>
              </ul>

              <h2 className="text-[#8E2DA8]">2. Información que recopilamos</h2>
              <ul>
                <li>
                  <strong>Datos de cuenta:</strong> nombre, correo y contraseña.
                </li>
                <li>
                  <strong>Datos del negocio:</strong> productos, ventas, abonos,
                  usuarios del equipo, reportes.
                </li>
                <li>
                  <strong>Datos técnicos:</strong> dispositivo, navegador, IP y
                  uso anónimo.
                </li>
              </ul>
              <p>
                No recopilamos información financiera sensible ni datos
                biométricos.
              </p>

              <h2 className="text-[#8E2DA8]">3. Cómo usamos tu información</h2>
              <ol>
                <li>Crear y administrar tu cuenta.</li>
                <li>Brindarte acceso a las funcionalidades.</li>
                <li>Enviar notificaciones relacionadas con el servicio.</li>
                <li>Mejorar el producto mediante análisis internos.</li>
              </ol>
              <p>
                <strong>Nunca</strong> vendemos tus datos ni los compartimos con
                terceros sin tu consentimiento.
              </p>

              <h2 className="text-[#8E2DA8]">4. Almacenamiento y seguridad</h2>
              <p>
                Los datos se almacenan en{" "}
                <strong>Firebase (Google Cloud)</strong>, con medidas de cifrado
                y control de acceso. Adoptamos prácticas para prevenir accesos
                no autorizados, pérdida o alteración.
              </p>

              <h2 className="text-[#8E2DA8]">
                5. Acceso y control de tus datos
              </h2>
              <p>Como usuario puedes:</p>
              <ul>
                <li>Acceder y rectificar tus datos.</li>
                <li>Solicitar la eliminación de tu cuenta.</li>
                <li>Solicitar una copia (exportación a Excel/CSV).</li>
              </ul>
              <p>Escríbenos para ejercer estos derechos.</p>

              <h2 className="text-[#8E2DA8]">
                6. Conservación de la información
              </h2>
              <p>
                Conservamos tus datos mientras la cuenta esté activa. Al
                eliminarla, borraremos la información en un máximo de{" "}
                <strong>30 días</strong>.
              </p>

              <h2 className="text-[#8E2DA8]">
                7. Cookies y tecnologías similares
              </h2>
              <p>
                Usamos cookies/local storage para sesión, preferencias y
                métricas anónimas. Puedes desactivarlas en tu navegador (algunas
                funciones podrían verse afectadas).
              </p>

              <h2 className="text-[#8E2DA8]">8. Servicios de terceros</h2>
              <ul>
                <li>Firebase Authentication (login/registro)</li>
                <li>Firestore/Storage (datos y archivos)</li>
                <li>Opcional: Google Analytics (métricas anónimas)</li>
              </ul>

              <h2 className="text-[#8E2DA8]">9. Menores de edad</h2>
              <p>
                InManager no está dirigido a menores de 16 años. Eliminaremos
                cuentas identificadas sin autorización válida.
              </p>

              <h2 className="text-[#8E2DA8]">10. Cambios en esta política</h2>
              <p>
                Podremos actualizar esta Política. Te avisaremos ante cambios
                relevantes dentro de la app o por correo.
              </p>

              <h2 className="text-[#8E2DA8]">11. Contacto</h2>
              <p>Para dudas o solicitudes:</p>
              <div className="not-prose mt-2 grid sm:grid-cols-2 gap-3">
                <a
                  href="mailto:juanprendon2603@gmail.com"
                  className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-4 py-3 hover:bg-white transition"
                >
                  <Mail className="w-4 h-4 text-[#8E2DA8]" />{" "}
                  juanprendon2603@gmail.com
                </a>
                <a
                  href="https://wa.me/573168878200?text=Hola%20InManager,%20tengo%20una%20consulta%20sobre%20privacidad."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-4 py-3 hover:bg-white transition"
                >
                  <Phone className="w-4 h-4 text-[#8E2DA8]" /> +57 316 887 8200
                  (WhatsApp)
                </a>
              </div>
            </div>

            {/* Botones inferiores */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/60 bg-white/80 hover:bg-white transition text-[#8E2DA8] font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              {/* Si luego quieres PDF, aquí podrías enlazarlo */}
              {/* <a href="/docs/politica-privacidad.pdf" download className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white">Descargar PDF</a> */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
