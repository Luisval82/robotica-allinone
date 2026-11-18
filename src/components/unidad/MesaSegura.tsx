"use client";

// Red de seguridad alrededor de la mesa de bloques.
//
// La mesa es lo más complicado de la plataforma y vive en el navegador. Si
// algo falla ahí dentro, lo que NO puede pasar es que se caiga la unidad
// entera y el alumno se quede mirando una pantalla de error en mitad de la
// clase. Esto corta el fallo aquí y deja a la vista la lista de bloques, que
// hace lo mismo y no falla.

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Qué enseñar en lugar de la mesa cuando algo ha fallado. */
  alFallar: ReactNode;
}

export class MesaSegura extends Component<Props, { roto: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { roto: false };
  }

  static getDerivedStateFromError() {
    return { roto: true };
  }

  componentDidCatch(error: unknown) {
    // Queda en la consola del navegador, que es donde se mira cuando el
    // profesor avisa de que «la mesa no va».
    console.error("[mesa de bloques]", error);
  }

  render() {
    return this.state.roto ? this.props.alFallar : this.props.children;
  }
}
