<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_endpoint_returns_ok(): void{
        $this->getJson("/api/v1/health")
        ->assertOk()
        ->assertJson(["status" => "ok"]);
    }
}
