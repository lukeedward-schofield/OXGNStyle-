<?php
namespace App\Enums;

enum ProductCategory: string
{
    case Top = 'top';
    case Bottom = 'bottom';
    case Outerwear = 'outerwear';
    case Footwear = 'footwear';
    case Accessory = 'accessory';
}