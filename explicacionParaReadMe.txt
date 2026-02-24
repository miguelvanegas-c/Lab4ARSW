Primeras correciones en el frontend, tenia problemas con los cors, por lo tanto no era capz de dibujar el ejemplo que tenia el backend entregado

Ahora corregir cors en el contenedor previamente implementado, aparte se logro que conservara los datos cuando se apaga el contenedor

Problema con current, debido a que no eran funcione, si no objetos y por lo tanto fallaban.

Lo primero que se hizo fue conectar el front con el backend para que sea capaz de consultar el nombre del blueprint que sale en pantalla.

Se hizo un bloqueo en la aplicacion previamente montada, debido a que fue necesario, que al agregar un punto se lock la base de datos para evitar errores de concurrencia

Cambiamos el backend para que se sincronize correctamente.

Muchas correciones en el frontend para que funcione la sincronizacion pero funciono dio mio