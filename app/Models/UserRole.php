<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    protected $connection = 'usermgt_db';
    protected $table = 'UsrRole';
    protected $primaryKey = 'UsrRole_ID';

    public function user()
    {
        return $this->belongsTo(User::class, 'Usr_ID');
    }

    public function roleInfo()
    {
        return $this->belongsTo(Role::class, 'Role_ID');
    }
}
