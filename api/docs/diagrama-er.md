# Diagrama Entidad-Relación

## Estructura de la Base de Datos
```mermaid
erDiagram
    users ||--o{ tareas : "hasMany"
    tareas }o--|| users : "belongsTo"
    tareas }o--o{ tags : "belongsToMany"
    
    users {
        bigint id PK
        string name
        string email UK
        string password
        string avatar "nullable"
        json avatar_exif "nullable"
        timestamp created_at
        timestamp updated_at
    }
    
    tareas {
        bigint id PK
        bigint user_id FK
        string titulo "max 150"
        text descripcion "nullable"
        boolean completada "default false"
        date fecha_limite "nullable"
        decimal latitud "nullable"
        decimal longitud "nullable"
        timestamp created_at
        timestamp updated_at
    }
    
    tags {
        bigint id PK
        string nombre "max 50"
        string color "hex 7 chars"
        timestamp created_at
        timestamp updated_at
    }
    
    tarea_tag {
        bigint tarea_id FK
        bigint tag_id FK
    }
```

## Relaciones

| Relación | Descripción |
|----------|-------------|
| User → Tareas | Un usuario tiene muchas tareas (hasMany) |
| Tarea → User | Una tarea pertenece a un usuario (belongsTo) |
| Tarea ↔ Tags | Relación muchos a muchos mediante tabla pivote `tarea_tag` |