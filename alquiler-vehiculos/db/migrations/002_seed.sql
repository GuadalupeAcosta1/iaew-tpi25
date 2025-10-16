insert into vehiculo (patente, marca, modelo, anio, estado) values
 ('AB123CD','Toyota','Yaris',2022,'disponible')
 ,('AC456EF','VW','Gol',2021,'disponible')
 ,('AD789GH','Renault','Kwid',2023,'mantenimiento')
 on conflict do nothing;
