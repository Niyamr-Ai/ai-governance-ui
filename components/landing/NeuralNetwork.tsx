"use client";

import { useEffect, useRef } from "react";

type ParticleType = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    update: () => void;
    draw: (ctx: CanvasRenderingContext2D) => void;
};

export default function NeuralNetwork() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return;


        const ctx = canvas.getContext("2d");
        if (ctx === null) return;

        let animationFrameId: number;
        let particles: ParticleType[] = [];

        const resizeCanvas = (): void => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle implements ParticleType {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            private canvasWidth: number;
            private canvasHeight: number;

            constructor(canvasWidth: number, canvasHeight: number) {
                this.canvasWidth = canvasWidth;
                this.canvasHeight = canvasHeight;
                this.x = Math.random() * canvasWidth;
                this.y = Math.random() * canvasHeight;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
            }

            update(): void {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > this.canvasWidth) this.vx *= -1;
                if (this.y < 0 || this.y > this.canvasHeight) this.vy *= -1;
            }

            draw(ctx: CanvasRenderingContext2D): void {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(91, 127, 206, 0.4)";
                ctx.fill();
            }
        }

        const init = (): void => {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(canvas.width, canvas.height));
            }
        };

        const connectParticles = (): void => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(91, 127, 206, ${0.15 * (1 - distance / 150)
                            })`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = (): void => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.update();
                particle.draw(ctx);
            });

            connectParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        init();
        animate();

        const handleResize = (): void => {
            resizeCanvas();
            init();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.4 }}
        />
    );
}

