# ArcaSin: Sin fallas, sin quiebres y sin sorpresas

## Lo que me inspiró
La inspiración principal surgió al observar un problema crítico en la logística de la cadena de suministro: la entrega de productos equivocados a los tenderos, lo que inevitablemente generaba pérdida de ventas y migración de clientes a la competencia. Quería transformar este frustrante problema operativo en una herramienta proactiva que realmente genere lealtad. Al anticipar la falta de inventario de manera temprana, justo en la etapa de preventa en el carrito de la aplicación, mi proyecto busca ofrecer soluciones inmediatas en lugar de sorpresas decepcionantes.

## Cómo construí el proyecto
El proyecto fue desarrollado íntegramente utilizando Python 3.x, aprovechando Streamlit para la interfaz interactiva y Pandas para manejar el procesamiento de datos financieros. Para el diseño visual y la estructura web, incorporé HTML5 y CSS3. 

Las características arquitectónicas clave de la solución incluyen:
* **Motor de Interrupción Anticipada:** Un mecanismo que pausa la transacción si un artículo como Coca-Cola Original 600ml está agotado, desplegando inmediatamente una ventana de contingencia con un sustituto ideal.
* **Gamificación (Retos Express):** Para incentivar la aceptación de sustitutos, construí una función que ofrece protección del precio original y puntos canjeables por mobiliario físico para la tienda como hieleras, mesas o artículos decorativos.
* **Caja Digital (Tapitas):** Una herramienta que permite a los tenderos ingresar digitalmente las tapas promocionales físicas, descontando automáticamente el valor de su total a pagar. Esto otorga liquidez inmediata sin esperar la recolección física.

Para demostrar la robustez de la arquitectura, integré un Panel de Simulación en tiempo real que gestiona tres escenarios críticos: 
1. Forzar alertas de falta de stock en el carrito.
2. Digitalizar incidentes en ruta para generar notas de crédito instantáneas por mercancía dañada.
3. Calcular retrasos por tráfico para actualizar dinámicamente la hora estimada de llegada (ETA). 

La lógica matemática para los ajustes dinámicos de la ETA en el panel logístico se puede representar como:
$$ETA_{actualizada} = ETA_{original} + \sum_{i=1}^{n} \Delta t_{retraso_i}$$

## Retos que enfrenté
Garantizar una estabilidad y resiliencia absolutas durante las operaciones pico fue un obstáculo importante. Tuve que implementar bloques de aislamiento (`try/except`) y renderizado visual autónomo para evitar que la aplicación fallara durante caídas de red. Para mantener un estado impecable entre presentaciones, también integré un botón de "Limpieza Total" de caché para reiniciar la aplicación de forma segura.

Otro desafío importante fue abordar la estrecha concentración temporal de los problemas logísticos. La analítica de datos reveló que el 65% de los eventos de desabasto ocurren durante una ventana altamente crítica —entre las 11:00 AM y las 2:00 PM— lo cual coincide con los pedidos de última hora de los tenderos. Proteger los márgenes de ganancia de los segmentos en riesgo, como las tiendas comerciales o escolares de alta rotación, requería que las intervenciones fueran excepcionalmente rápidas y precisas durante estas horas pico.

## Lo que aprendí
A través del análisis de los datos de diagnóstico, obtuve información valiosa sobre el comportamiento de sustitución. La estrategia demostró ser altamente efectiva cuando las alternativas estaban dirigidas con precisión. Por ejemplo, reemplazar Coca-Cola Original 600ml por la variante Sin Azúcar logró una tasa de éxito del 84%. De manera similar, sustituir Fanta Naranja por Fanta Uva arrojó una tasa de éxito del 71%.

Estas métricas demostraron que los tenderos son muy receptivos a adaptar su inventario si la alternativa se presenta de manera fluida y está respaldada por los incentivos adecuados. Esto reforzó la idea de que la tecnología bien implementada puede cerrar efectivamente la brecha entre las restricciones logísticas y la satisfacción continua del cliente.
