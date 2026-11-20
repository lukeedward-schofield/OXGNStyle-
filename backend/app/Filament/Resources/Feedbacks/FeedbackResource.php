<?php

namespace App\Filament\Resources\Feedbacks;

use App\Filament\Resources\Feedbacks\Pages\ListFeedback;
use App\Models\Feedback;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class FeedbackResource extends Resource
{
    protected static ?string $model = Feedback::class;

    protected static ?string $slug = 'feedback';

    protected static ?string $modelLabel = 'feedback';

    protected static ?string $pluralModelLabel = 'feedback';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')->label('Sent')->dateTime()->sortable(),
                TextColumn::make('user.name')->label('From')->searchable(),
                TextColumn::make('rating')->sortable(),
                TextColumn::make('comment')->limit(80)->placeholder('No comment')->searchable(),
                TextColumn::make('page')->placeholder('-'),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFeedback::route('/'),
        ];
    }
}