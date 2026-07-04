"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loginOk, setLoginOk] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    setFormError(null);
    setLoginOk(false);
    if (!EMAIL_RE.test(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);

    startTransition(async () => {
      if (tab === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password: pass }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.error ?? "No se pudo crear la cuenta.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password: pass,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Correo o contraseña incorrectos.");
        return;
      }

      setLoginOk(true);
      setTimeout(() => router.push("/"), 900);
    });
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-140px)] max-w-[1180px] grid-cols-1 gap-10 px-6 py-10 min-[880px]:grid-cols-2">
      <div className="relative hidden flex-col justify-center overflow-hidden rounded-3xl border border-white/10 p-10 min-[880px]:flex">
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(163,230,53,.2), transparent 65%)" }}
        />
        <div className="relative">
          <div className="font-heading text-2xl font-bold text-white">
            VITA<span className="text-vt-accent">TECH_</span>
          </div>
          <h2 className="font-heading mt-6 text-[40px] leading-[1.12] font-bold text-white">
            Tu tecnología,
            <br />
            en un solo <span className="text-vt-accent">lugar</span>
          </h2>
          <ul className="mt-6 flex flex-col gap-3 text-[14px] text-vt-muted-1">
            <li>✓ Envío a todo el país</li>
            <li>✓ Garantía real con servicio técnico propio</li>
            <li>✓ Pago seguro con tarjeta o contra entrega</li>
          </ul>
          <div className="mt-10 text-[12px] text-vt-muted-3">
            © {new Date().getFullYear()} Importadora Vitatech.
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex rounded-[99px] border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className="flex-1 rounded-[99px] py-2.5 text-[13.5px] transition-all"
            style={
              tab === "login"
                ? { background: "#a3e635", color: "#1a2e05", fontWeight: 800 }
                : { color: "#a8a29e", fontWeight: 700 }
            }
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className="flex-1 rounded-[99px] py-2.5 text-[13.5px] transition-all"
            style={
              tab === "register"
                ? { background: "#a3e635", color: "#1a2e05", fontWeight: 800 }
                : { color: "#a8a29e", fontWeight: 700 }
            }
          >
            Registrarme
          </button>
        </div>

        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {tab === "register" && (
            <div>
              <div className="mb-2 text-[13px] font-bold text-vt-fg">Nombre completo</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-3 text-vt-fg"
                required
              />
            </div>
          )}

          <div>
            <div className="mb-2 text-[13px] font-bold text-vt-fg">Correo electrónico</div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
              }}
              className="w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-3 text-vt-fg"
              required
            />
            {emailError && (
              <div className="mt-1.5 text-[12.5px] text-vt-error">Ingresa un correo válido.</div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-bold text-vt-fg">Contraseña</span>
              <button type="button" className="text-[12px] text-vt-accent">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-3 text-vt-fg"
              required
              minLength={6}
            />
          </div>

          {formError && <div className="text-[13px] text-vt-error">{formError}</div>}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-[10px] bg-vt-accent py-3 text-[15px] font-extrabold text-vt-accent-fg disabled:opacity-60"
          >
            {tab === "register" ? "Crear cuenta" : "Entrar"}
          </button>

          {loginOk && (
            <div className="text-center text-[13px] font-bold text-vt-accent">
              ✓ ¡Bienvenido! Sesión iniciada.
            </div>
          )}

          <div className="my-1 flex items-center gap-3 text-[12px] text-vt-muted-2">
            <div className="h-px flex-1 bg-white/10" />o continúa con
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-[10px] border border-white/[.14] py-2.5 text-[13.5px] font-semibold text-vt-fg hover:border-vt-accent hover:text-vt-accent"
            >
              Google
            </button>
            <button
              type="button"
              className="flex-1 rounded-[10px] border border-white/[.14] py-2.5 text-[13.5px] font-semibold text-vt-fg hover:border-vt-accent hover:text-vt-accent"
            >
              Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
