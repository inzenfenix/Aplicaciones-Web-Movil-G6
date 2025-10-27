<?php

namespace App\Models;

use BaoPham\DynamoDb\DynamoDbModel;

class Alergia extends DynamoDbModel
{
    protected $table = 'Alergias';
    protected $primaryKey = 'idAlergia';
    protected $fillable = [
        'idAlergia',
        'nombre',
        'descripcion',
        'gravedad',
    ];
}
