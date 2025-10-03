"use client";

import Layout from "@/components/Layout";
import RoleCard from "@/components/RoleCard";

const rolesData = [
  {
    title: "Administrador",
    description:
      "Acceso total al sistema y gestión de todos los módulos y usuarios.",
    sections: [
      {
        title: "Gestión de Facultades",
        permissions: [
          { label: "Ver facultades", checked: true },
          { label: "Crear facultades", checked: true },
          { label: "Editar facultades", checked: true },
          { label: "Eliminar facultades", checked: true },
        ],
      },
      {
        title: "Gestión de Carreras",
        permissions: [
          { label: "Ver carreras", checked: true },
          { label: "Crear carreras", checked: true },
          { label: "Editar carreras", checked: true },
          { label: "Eliminar carreras", checked: true },
        ],
      },
      {
        title: "Gestión de Usuarios",
        permissions: [
          { label: "Ver profesores", checked: true },
          { label: "Crear profesores", checked: true },
          { label: "Editar profesores", checked: true },
          { label: "Eliminar profesores", checked: true },
        ],
      },
      {
        title: "Gestión de Usuarios y Roles",
        permissions: [
          { label: "Ver usuarios", checked: true },
          { label: "Asignar roles", checked: true },
          { label: "Desactivar usuarios", checked: true },
          { label: "Ver roles", checked: true },
          { label: "Configurar permisos", checked: true },
        ],
      },
    ],
  },
  {
    title: "CEI (Comité de Evaluación Interna)",
    description:
      "Acceso a la información relevante para el proceso de acreditación.",
    sections: [
      {
        title: "Gestión de Facultades",
        permissions: [
          { label: "Ver facultades", checked: true },
          { label: "Crear facultades", checked: false },
          { label: "Editar facultades", checked: false },
          { label: "Eliminar facultades", checked: false },
        ],
      },
      {
        title: "Gestión de Carreras",
        permissions: [
          { label: "Ver carreras", checked: true },
          { label: "Crear carreras", checked: false },
          { label: "Editar carreras", checked: false },
          { label: "Eliminar carreras", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios",
        permissions: [
          { label: "Ver profesores", checked: true },
          { label: "Crear profesores", checked: false },
          { label: "Editar profesores", checked: false },
          { label: "Eliminar profesores", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios y Roles",
        permissions: [
          { label: "Ver usuarios", checked: true },
          { label: "Asignar roles", checked: false },
          { label: "Desactivar usuarios", checked: false },
          { label: "Ver roles", checked: true },
          { label: "Configurar permisos", checked: false },
        ],
      },
    ],
  },
  {
    title: "Autoridad de facultad",
    description:
      "Gestión de facultades y acceso a la información de carreras asociadas.",
    sections: [
      {
        title: "Gestión de Facultades",
        permissions: [
          { label: "Ver facultades", checked: true },
          { label: "Crear facultades", checked: false },
          { label: "Editar facultades", checked: true },
          { label: "Eliminar facultades", checked: false },
        ],
      },
      {
        title: "Gestión de Carreras",
        permissions: [
          { label: "Ver carreras", checked: true },
          { label: "Crear carreras", checked: true },
          { label: "Editar carreras", checked: true },
          { label: "Eliminar carreras", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios",
        permissions: [
          { label: "Ver profesores", checked: true },
          { label: "Crear profesores", checked: true },
          { label: "Editar profesores", checked: true },
          { label: "Eliminar profesores", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios y Roles",
        permissions: [
          { label: "Ver usuarios", checked: false },
          { label: "Asignar roles", checked: false },
          { label: "Desactivar usuarios", checked: false },
          { label: "Ver roles", checked: false },
          { label: "Configurar permisos", checked: false },
        ],
      },
    ],
  },
  {
    title: "Coordinador de Carrera",
    description:
      "Gestión de carreras específicas y acceso a información de profesores.",
    sections: [
      {
        title: "Gestión de Facultades",
        permissions: [
          { label: "Ver facultades", checked: true },
          { label: "Crear facultades", checked: false },
          { label: "Editar facultades", checked: false },
          { label: "Eliminar facultades", checked: false },
        ],
      },
      {
        title: "Gestión de Carreras",
        permissions: [
          { label: "Ver carreras", checked: true },
          { label: "Crear carreras", checked: false },
          { label: "Editar carreras", checked: true },
          { label: "Eliminar carreras", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios",
        permissions: [
          { label: "Ver profesores", checked: true },
          { label: "Crear profesores", checked: false },
          { label: "Editar profesores", checked: true },
          { label: "Eliminar profesores", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios y Roles",
        permissions: [
          { label: "Ver usuarios", checked: false },
          { label: "Asignar roles", checked: false },
          { label: "Desactivar usuarios", checked: false },
          { label: "Ver roles", checked: false },
          { label: "Configurar permisos", checked: false },
        ],
      },
    ],
  },
  {
    title: "Profesor",
    description: "Gestión de carreras específicas",
    sections: [
      {
        title: "Gestión de Facultades",
        permissions: [
          { label: "Ver facultades", checked: true },
          { label: "Crear facultades", checked: false },
          { label: "Editar facultades", checked: false },
          { label: "Eliminar facultades", checked: false },
        ],
      },
      {
        title: "Gestión de Carreras",
        permissions: [
          { label: "Ver carreras", checked: true },
          { label: "Crear carreras", checked: false },
          { label: "Editar carreras", checked: true },
          { label: "Eliminar carreras", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios",
        permissions: [
          { label: "Ver profesores", checked: false },
          { label: "Crear profesores", checked: false },
          { label: "Editar profesores", checked: false },
          { label: "Eliminar profesores", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios y Roles",
        permissions: [
          { label: "Ver usuarios", checked: false },
          { label: "Asignar roles", checked: false },
          { label: "Desactivar usuarios", checked: false },
          { label: "Ver roles", checked: false },
          { label: "Configurar permisos", checked: false },
        ],
      },
    ],
  },
  {
    title: "Personal Administrativo",
    description:
      "Gestión de carreras específicas y acceso a información de profesores.",
    sections: [
      {
        title: "Gestión de Facultades",
        permissions: [
          { label: "Ver facultades", checked: true },
          { label: "Crear facultades", checked: false },
          { label: "Editar facultades", checked: false },
          { label: "Eliminar facultades", checked: false },
        ],
      },
      {
        title: "Gestión de Carreras",
        permissions: [
          { label: "Ver carreras", checked: true },
          { label: "Crear carreras", checked: false },
          { label: "Editar carreras", checked: true },
          { label: "Eliminar carreras", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios",
        permissions: [
          { label: "Ver profesores", checked: false },
          { label: "Crear profesores", checked: false },
          { label: "Editar profesores", checked: false },
          { label: "Eliminar profesores", checked: false },
        ],
      },
      {
        title: "Gestión de Usuarios y Roles",
        permissions: [
          { label: "Ver usuarios", checked: false },
          { label: "Asignar roles", checked: false },
          { label: "Desactivar usuarios", checked: false },
          { label: "Ver roles", checked: false },
          { label: "Configurar permisos", checked: false },
        ],
      },
    ],
  },
];

export default function Roles() {
  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto">
        <h1 className="text-[#171A1F] text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight font-montserrat mb-4 sm:mb-6">
          Gestión de Roles
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {rolesData.map((role, index) => (
            <RoleCard
              key={index}
              title={role.title}
              description={role.description}
              sections={role.sections}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}