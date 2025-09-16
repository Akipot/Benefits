<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Helpers\MyHelper;
use Illuminate\Support\Facades\DB;

class Role extends Model
{
    protected $connection = 'usermgt_db';
    protected $table = 'Role';
    protected $primaryKey = 'Role_ID';

    public function info()
    {
        return $this->hasMany(UserRole::class, 'Role_ID');
    }
}
