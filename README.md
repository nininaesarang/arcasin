# 📦 ArcaSin: Sin fallas, sin quiebres y sin sorpresas

## 💡 Lo que me inspiró
La inspiración principal surgió al observar un problema crítico en la logística de la cadena de suministro: la entrega de productos equivocados a los tenderos, lo que inevitablemente generaba pérdida de ventas y migración de clientes a la competencia. 🚚 Quería transformar este frustrante problema operativo en una herramienta proactiva que realmente genere lealtad. 🤝 Al anticipar la falta de inventario de manera temprana, justo en la etapa de preventa en el carrito de la aplicación, mi proyecto busca ofrecer soluciones inmediatas en lugar de sorpresas decepcionantes. ✨

## 🛠️ Cómo construí el proyecto
El proyecto fue desarrollado íntegramente utilizando Python 3.x 🐍, aprovechando Streamlit para la interfaz interactiva y Pandas para manejar el procesamiento de datos financieros. 📊 Para el diseño visual y la estructura web, incorporé HTML5 y CSS3. 🌐

Las características arquitectónicas clave de la solución incluyen:
* **🛑 Motor de Interrupción Anticipada:** Un mecanismo que pausa la transacción si un artículo como Coca-Cola Original 600ml está agotado, desplegando inmediatamente una ventana de contingencia con un sustituto ideal. 🥤
* **🎮 Gamificación (Retos Express):** Para incentivar la aceptación de sustitutos, construí una función que ofrece protección del precio original y puntos canjeables por mobiliario físico para la tienda como hieleras, mesas o artículos decorativos. 🎁
* **💳 Caja Digital (Tapitas):** Una herramienta que permite a los tenderos ingresar digitalmente las tapas promocionales físicas, descontando automáticamente el valor de su total a pagar. Esto otorga liquidez inmediata sin esperar la recolección física. 💰

Para demostrar la robustez de la arquitectura, integré un Panel de Simulación en tiempo real 🎛️ que gestiona tres escenarios críticos: 
1. Forzar alertas de falta de stock en el carrito. 🛒
2. Digitalizar incidentes en ruta para generar notas de crédito instantáneas por mercancía dañada. 📝
3. Calcular retrasos por tráfico para actualizar dinámicamente la hora estimada de llegada (ETA). ⏱️

La lógica matemática para los ajustes dinámicos de la ETA en el panel logístico se puede representar como:
$$ETA_{actualizada} = ETA_{original} + \sum_{i=1}^{n} \Delta t_{retraso_i}$$

## 🧗‍♀️ Retos que enfrenté
Garantizar una estabilidad y resiliencia absolutas durante las operaciones pico fue un obstáculo importante. 🚧 Tuve que implementar bloques de aislamiento (`try/except`) y renderizado visual autónomo para evitar que la aplicación fallara durante caídas de red. 📶 Para mantener un estado impecable entre presentaciones, también integré un botón de "Limpieza Total" de caché para reiniciar la aplicación de forma segura. 🔄

Otro desafío importante fue abordar la estrecha concentración temporal de los problemas logísticos. ⏳ La analítica de datos reveló que el 65% de los eventos de desabasto ocurren durante una ventana altamente crítica —entre las 11:00 AM y las 2:00 PM— lo cual coincide con los pedidos de última hora de los tenderos. 📈 Proteger los márgenes de ganancia de los segmentos en riesgo, como las tiendas comerciales o escolares de alta rotación, requería que las intervenciones fueran excepcionalmente rápidas y precisas durante estas horas pico. 🎯

## 🧠 Lo que aprendí
A través del análisis de los datos de diagnóstico, obtuve información valiosa sobre el comportamiento de sustitución. 💡 La estrategia demostró ser altamente efectiva cuando las alternativas estaban dirigidas con precisión. Por ejemplo, reemplazar Coca-Cola Original 600ml por la variante Sin Azúcar logró una tasa de éxito del 84%. 🥤 De manera similar, sustituir Fanta Naranja por Fanta Uva arrojó una tasa de éxito del 71%. 🍇

Estas métricas demostraron que los tenderos son muy receptivos a adaptar su inventario si la alternativa se presenta de manera fluida y está respaldada por los incentivos adecuados. 🤝 Esto reforzó la idea de que la tecnología bien implementada puede cerrar efectivamente la brecha entre las restricciones logísticas y la satisfacción continua del cliente. ✅
## Lo que aprendí
A través del análisis de los datos de diagnóstico, obtuve información valiosa sobre el comportamiento de sustitución. La estrategia demostró ser altamente efectiva cuando las alternativas estaban dirigidas con precisión. Por ejemplo, reemplazar Coca-Cola Original 600ml por la variante Sin Azúcar logró una tasa de éxito del 84%. De manera similar, sustituir Fanta Naranja por Fanta Uva arrojó una tasa de éxito del 71%.

Estas métricas demostraron que los tenderos son muy receptivos a adaptar su inventario si la alternativa se presenta de manera fluida y está respaldada por los incentivos adecuados. Esto reforzó la idea de que la tecnología bien implementada puede cerrar efectivamente la brecha entre las restricciones logísticas y la satisfacción continua del cliente.

# 📦 ArcaSin: No failures, no shortages, and no surprises

## 💡 What inspired me
The main inspiration came from observing a critical problem in supply chain logistics: delivering the wrong products to store owners, which inevitably led to lost sales and customer migration to the competition. 🚚 I wanted to transform this frustrating operational issue into a proactive tool that truly builds loyalty. 🤝 By anticipating inventory shortages early, right at the pre-sale stage in the app's cart, my project seeks to offer immediate solutions instead of disappointing surprises. ✨

## 🛠️ How I built the project
The project was developed entirely using Python 3.x 🐍, leveraging Streamlit for the interactive interface and Pandas to handle financial data processing. 📊 For the visual design and web structure, I incorporated HTML5 and CSS3. 🌐

The key architectural features of the solution include:
* **🛑 Early Interruption Engine:** A mechanism that pauses the transaction if an item like Coca-Cola Original 600ml is out of stock, immediately deploying a contingency window with an ideal substitute. 🥤
* **🎮 Gamification (Express Challenges):** To encourage the acceptance of substitutes, I built a feature that offers original price protection and points redeemable for physical store furniture like coolers, tables, or decorative items. 🎁
* **💳 Digital Wallet (Tapitas):** A tool that allows store owners to digitally input physical promotional caps, automatically deducting the value from their total due. This grants immediate liquidity without waiting for physical collection. 💰

To demonstrate the architecture's robustness, I integrated a real-time Simulation Panel 🎛️ that manages three critical scenarios:
1. Forcing out-of-stock alerts in the cart. 🛒
2. Digitizing en-route incidents to generate instant credit notes for damaged merchandise. 📝
3. Calculating traffic delays to dynamically update the Estimated Time of Arrival (ETA). ⏱️

The mathematical logic for dynamic ETA adjustments in the logistics panel can be represented as:
$$ETA_{updated} = ETA_{original} + \sum_{i=1}^{n} \Delta t_{delay_i}$$

## 🧗‍♀️ Challenges I faced
Ensuring absolute stability and resilience during peak operations was a major hurdle. 🚧 I had to implement isolation blocks (`try/except`) and autonomous visual rendering to prevent the application from crashing during network drops. 📶 To maintain a pristine state between presentations, I also integrated a "Total Clear" cache button to safely restart the app. 🔄

Another significant challenge was addressing the tight temporal concentration of logistical problems. ⏳ Data analytics revealed that 65% of out-of-stock events occur during a highly critical window—between 11:00 AM and 2:00 PM—which coincides with last-minute orders from store owners. 📈 Protecting the profit margins of at-risk segments, such as high-rotation commercial or school stores, required the interventions to be exceptionally fast and accurate during these peak hours. 🎯

## 🧠 What I learned
Through the analysis of diagnostic data, I gained valuable insights into substitution behavior. 💡 The strategy proved to be highly effective when the alternatives were precisely targeted. For example, replacing Coca-Cola Original 600ml with the Zero Sugar variant achieved an 84% success rate. 🥤 Similarly, substituting Fanta Orange with Fanta Grape yielded a 71% success rate. 🍇

These metrics demonstrated that store owners are highly receptive to adapting their inventory if the alternative is presented seamlessly and is backed by the right incentives. 🤝 This reinforced the idea that well-implemented technology can effectively bridge the gap between logistical constraints and continuous customer satisfaction. ✅

##Images

![Login de ArcaSin]("login.png")

