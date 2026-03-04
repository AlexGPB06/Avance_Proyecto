import React from 'react';

function QuienesSomos() {
    const miembros = [
        { nombre: "Hugo", rol: "Voz Principal y Guitarra", imagen: "/img/Hugo Voz.jpeg", bio: "El alma lírica de la banda. Escribe verdades que el gobierno no quiere que escuches." },
        { nombre: "Zekar", rol: "Bajo", imagen: "/img/Zekar Bajo.jpeg", bio: "Líneas de bajo tan profundas como los secretos de estado." },
        { nombre: "Eliseo", rol: "Batería", imagen: "/img/141109487eecf71695ce3d30be6977ca.jpg", bio: "Marca el ritmo de la revolución. Imparable y explosivo." },
        { nombre: "Caleb", rol: "Guitarra", imagen: "/img/Caleb Guitarra.jpeg", bio: "Crea las atmósferas que te transportan a otra dimensión." }
    ];

    return (
        <section className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            <div style={{ position: 'relative', height: '350px', borderRadius: '15px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                <img src="/img/charro.jpeg" alt="Banda" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5) contrast(1.2)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                    <h1 style={{ fontSize: '4em', margin: 0, color: '#fff', textShadow: '0 0 20px var(--highlight-color)', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '5px' }}>Palomas del Gobierno</h1>
                    <p style={{ fontSize: '1.2em', color: '#ccc', letterSpacing: '2px' }}>MÚSICA QUE DESAFÍA EL SISTEMA</p>
                </div>
            </div>

            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 50px auto' }}>
                <h2 style={{ color: 'var(--highlight-color)', fontSize: '2em' }}>NUESTRA HISTORIA</h2>
                <p style={{ fontSize: '1.1em', lineHeight: '1.8', color: '#bbb' }}>
                    Formados en las calles donde el silencio no es opción, <strong>Palomas del Gobierno</strong> nació como un grito de rebeldía. 
                    No somos solo una banda, somos un movimiento. Mezclamos el rock crudo con letras que cuestionan la realidad que nos imponen. 
                    Únete a la bandada.
                </p>
            </div>

            <h2 style={{ borderBottom: '2px solid var(--highlight-color)', paddingBottom: '10px', marginBottom: '30px' }}>LOS INTEGRANTES</h2>
            
            <div className="items-grid">
                {miembros.map((miembro, idx) => (
                    <div key={idx} className="item-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                            <img src={miembro.imagen} alt={miembro.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' }} className="card-image" />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '15px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5em' }}>{miembro.nombre}</h3>
                                <p style={{ margin: '5px 0 0 0', color: 'var(--highlight-color)', fontWeight: 'bold' }}>{miembro.rol}</p>
                            </div>
                        </div>
                        <div className="card-content">
                            <p style={{ margin: 0, color: '#aaa', fontStyle: 'italic', lineHeight: '1.5' }}>"{miembro.bio}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default QuienesSomos;