package com.elmakers.mine.bukkit.meta;

import javax.annotation.Nonnull;

import com.elmakers.mine.bukkit.world.generator.BaseChunkGenerator;

public class ChunkGeneratorDescription extends Configurable {

    public ChunkGeneratorDescription() {

    }

    public ChunkGeneratorDescription(@Nonnull Class<? extends BaseChunkGenerator> generatorClss, @Nonnull ParameterList parameters) {
        super(generatorClss, parameters, "Generator");
    }
}
